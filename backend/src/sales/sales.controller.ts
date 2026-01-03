import { Controller, Get, Post, Body } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Post('checkout')
    checkout(@Body() dto: any) {
        return this.salesService.checkout(dto);
    }

    @Get()
    findAll() {
        return this.salesService.findAll();
    }
}
