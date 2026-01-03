import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
    imports: [InventoryModule],
    controllers: [AiController],
    providers: [AiService],
})
export class AiModule { }
