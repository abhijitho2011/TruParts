import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class SalesService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) { }

    async checkout(dto: any) {
        // dto: { partyId, items: [{ productId, quantity, price, taxRate }], isCashSale, paymentMethod, paidAmount }

        return await this.db.transaction(async (tx) => {
            let totalAmount = 0;
            let totalTax = 0;

            // 1. Calculate Totals & Verify Stock
            for (const item of dto.items) {
                const product = await tx.query.products.findFirst({
                    where: eq(schema.products.id, item.productId),
                });

                if (!product) throw new BadRequestException(`Product ${item.productId} not found`);
                if (product.stock < item.quantity) {
                    throw new BadRequestException(`Insufficient stock for ${product.itemName}. Available: ${product.stock}`);
                }

                const lineTotal = item.price * item.quantity;
                // Simple tax calc: Tax is included or excluded?
                // User Requirement: "Sale Price (tax-inclusive)".
                // So Price in DB is tax-inclusive.
                // We need to back-calculate tax for reporting if needed, or just store the rate.
                // Current Schema has 'taxAmount' on invoice.
                // Tax Amount = (LineTotal * TaxRate) / (100 + TaxRate) ?? Or is TaxRate on top?
                // Usually GST is Inclusive in retail.
                // Let's assume inclusive for now based on req. 
                // Tax = (Price - (Price / (1 + Rate/100))) * Qty

                const rate = Number(item.taxRate);
                const basePrice = (item.price / (1 + rate / 100));
                const taxPerUnit = item.price - basePrice;

                totalTax += taxPerUnit * item.quantity;
                totalAmount += lineTotal;
            }

            // 2. Create Invoice
            const [invoice] = await tx.insert(schema.invoices).values({
                invoiceNumber: `INV-${Date.now()}`, // Simple generation
                partyId: dto.partyId || null,
                type: 'sales',
                date: new Date(),
                totalAmount: totalAmount.toFixed(2),
                taxAmount: totalTax.toFixed(2),
                isCashSale: dto.isCashSale,
            }).returning();

            // 3. Create Items & Update Stock
            for (const item of dto.items) {
                await tx.insert(schema.invoiceItems).values({
                    invoiceId: invoice.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    taxRate: item.taxRate,
                    amount: (item.price * item.quantity).toFixed(2),
                });

                // Decrement Stock
                await tx.update(schema.products)
                    .set({
                        stock: sql`${schema.products.stock} - ${item.quantity}`,
                        updatedAt: new Date()
                    })
                    .where(eq(schema.products.id, item.productId));
            }

            // 4. Handle Payment / Ledger
            // If Cash Sale or Partial Payment
            if (dto.paidAmount > 0) {
                await tx.insert(schema.transactions).values({
                    invoiceId: invoice.id,
                    partyId: dto.partyId || null, // Can be null for anonymous cash sale
                    amount: dto.paidAmount,
                    type: 'credit', // Money receiving = Credit to Company? No.
                    // Accounting: 
                    // Cash A/C Dr. (Debit increases asset)
                    // To Sales A/C (Credit increases income)
                    // In Party Ledger: Credit Party (Money received from Party reduces their balance? No, Payment from party is Credit to Party Ledger usually in ERPs if we view from Party perspective? 
                    // TruParts Logic: "Balance stored as party credit".
                    // Let's stick to: Credit = Money In, Debit = Money Out transaction type? 
                    // Or from Party perspective: Debit = They owe us. Credit = They paid us.
                    // Use 'credit' for Payment Received.
                    paymentMethod: dto.paymentMethod,
                    description: `Payment for Invoice #${invoice.invoiceNumber}`,
                });
            }

            return invoice;
        });
    }

    async findAll() {
        return this.db.query.invoices.findMany({
            with: {
                party: true,
                items: {
                    with: {
                        product: true
                    }
                }
            }
        });
    }
}
