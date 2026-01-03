import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Post()
    create(@Body() createProductDto: any) {
        return this.inventoryService.create(createProductDto);
    }

    @Get()
    findAll(@Query('search') search: string) {
        return this.inventoryService.findAll(search);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.inventoryService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProductDto: any) {
        return this.inventoryService.update(+id, updateProductDto);
    }
}
