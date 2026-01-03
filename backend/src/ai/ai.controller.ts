import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('whatsapp')
    async handleWebhook(@Body() body: any) {
        // Standard WhatsApp Business API payload structure is complex.
        // Simplifying: assumes body = { message: "customer text", from: "12345" }

        const message = body.message || body.text?.body || "";
        if (!message) return { status: 'ignored' };

        const reply = await this.aiService.processWhatsAppMessage(message);

        // In real webhook, we send a POST back to Meta API to reply. 
        // Here we just return the JSON for testing.
        return reply;
    }
}
