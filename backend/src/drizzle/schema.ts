import { pgTable, serial, text, integer, decimal, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const partyTypeEnum = pgEnum('party_type', ['client', 'supplier']);
export const invoiceTypeEnum = pgEnum('invoice_type', ['sales', 'purchase', 'sales_return', 'purchase_return']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'bank']);

// Products Table
export const products = pgTable('products', {
    id: serial('id').primaryKey(),
    itemName: text('item_name').notNull(),
    sku: text('sku').notNull().unique(),
    brand: text('brand'),
    make: text('make'),
    model: text('model'),
    variant: text('variant'),
    category: text('category'),
    subCategory: text('sub_category'),
    hsnCode: text('hsn_code'),
    taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0'), // e.g. 18.00
    purchasePrice: decimal('purchase_price', { precision: 10, scale: 2 }).notNull(),
    salePrice: decimal('sale_price', { precision: 10, scale: 2 }).notNull(),
    stock: integer('stock').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Parties Table
export const parties = pgTable('parties', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    gstNo: text('gst_no'),
    phone: text('phone'),
    address: text('address'),
    type: partyTypeEnum('type').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// Invoices Table
export const invoices = pgTable('invoices', {
    id: serial('id').primaryKey(),
    invoiceNumber: text('invoice_number').notNull().unique(), // Auto-generated
    partyId: integer('party_id').references(() => parties.id), // Nullable for Cash Sales/Walk-in
    type: invoiceTypeEnum('type').notNull(),
    date: timestamp('date').defaultNow().notNull(),
    totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
    taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).notNull(),
    roundOff: decimal('round_off', { precision: 5, scale: 2 }).default('0'),
    isCashSale: boolean('is_cash_sale').default(false), // Logic: if true, no credit allowed
    createdAt: timestamp('created_at').defaultNow(),
});

// Invoice Items Table
export const invoiceItems = pgTable('invoice_items', {
    id: serial('id').primaryKey(),
    invoiceId: integer('invoice_id').references(() => invoices.id).notNull(),
    productId: integer('product_id').references(() => products.id).notNull(),
    quantity: integer('quantity').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(), // Unit price at time of sale
    taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).notNull(),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(), // (Price * Qty)
});

// Ledger / Transactions Table (Money tracking)
export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    partyId: integer('party_id').references(() => parties.id), // Null logic: if null, it's generic Cash/Bank entry
    invoiceId: integer('invoice_id').references(() => invoices.id),
    amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
    type: text('type').notNull(), // 'credit' or 'debit'
    paymentMethod: paymentMethodEnum('payment_method'), // 'cash' or 'bank'
    description: text('description'),
    date: timestamp('date').defaultNow().notNull(),
});

// RELATIONS
export const partiesRelations = relations(parties, ({ many }) => ({
    invoices: many(invoices),
    transactions: many(transactions),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
    party: one(parties, {
        fields: [invoices.partyId],
        references: [parties.id],
    }),
    items: many(invoiceItems),
    transactions: many(transactions),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
    invoice: one(invoices, {
        fields: [invoiceItems.invoiceId],
        references: [invoices.id],
    }),
    product: one(products, {
        fields: [invoiceItems.productId],
        references: [products.id],
    }),
}));
