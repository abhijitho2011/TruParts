import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { eq, ilike, or } from 'drizzle-orm';

@Injectable()
export class InventoryService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) { }

    async findAll(search?: string) {
        if (search) {
            return this.db.query.products.findMany({
                where: or(
                    ilike(schema.products.itemName, `%${search}%`),
                    ilike(schema.products.sku, `%${search}%`),
                    ilike(schema.products.make, `%${search}%`),
                    ilike(schema.products.model, `%${search}%`),
                    ilike(schema.products.variant, `%${search}%`),
                ),
            });
        }
        return this.db.query.products.findMany();
    }

    async findOne(id: number) {
        return this.db.query.products.findFirst({
            where: eq(schema.products.id, id),
        });
    }

    async create(createProductDto: any) {
        // Basic DTO handling, assuming validation is done in controller/pipes
        return this.db.insert(schema.products).values(createProductDto).returning();
    }

    async update(id: number, updateProductDto: any) {
        return this.db
            .update(schema.products)
            .set({ ...updateProductDto, updatedAt: new Date() })
            .where(eq(schema.products.id, id))
            .returning();
    }

    // Stock is managed via sales/purchase, but manual adjustment might be needed
    async adjustStock(id: number, quantity: number) {
        // This is a simple set, but real adjustment should probably be transactional and logged
        return this.db
            .update(schema.products)
            .set({ stock: quantity, updatedAt: new Date() })
            .where(eq(schema.products.id, id))
            .returning();
    }
}
