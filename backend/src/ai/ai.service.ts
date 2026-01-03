import { Injectable } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class AiService {
    constructor(private readonly inventoryService: InventoryService) { }

    async processWhatsAppMessage(message: string): Promise<any> {
        // 1. NLU Extraction (Simulated for now, would call LLM)
        const entities = await this.mockExtractEntities(message);

        if (!entities.partName) {
            return {
                text: "I couldn't identify the part you are looking for. Please specify part name, make, and model."
            };
        }

        // 2. Search Inventory
        // Using the generic search for now, ideally strictly filter by Make/Model
        const products = await this.inventoryService.findAll(entities.partName);

        // 3. Filter by Make/Model if detected
        const filtered = products.filter(p => {
            let match = true;
            if (entities.make && p.make) {
                const searchMake = entities.make as string;
                match = match && p.make.toLowerCase().includes(searchMake.toLowerCase());
            }
            if (entities.model && p.model) {
                const searchModel = entities.model as string;
                match = match && p.model.toLowerCase().includes(searchModel.toLowerCase());
            }
            return match;
        });

        // 4. Format Response
        if (filtered.length === 0) {
            return { text: `Sorry, no stock found for ${entities.partName} (${entities.make || 'Any Make'} ${entities.model || ''})` };
        }

        const responseLines = filtered.map(p =>
            `*${p.itemName}* \nBrand: ${p.brand}\nPrice: ₹${p.salePrice}\nStock: ${p.stock}`
        );

        return {
            text: `Found ${filtered.length} items:\n\n${responseLines.join('\n\n')}`
        };
    }

    // This should be replaced by an actual LLM call
    private async mockExtractEntities(text: string): Promise<{ make?: string; model?: string; variant?: string; partName?: string }> {
        // Simple heuristic for demo: "audi a4 abs sensor"
        // Assuming last 1-2 words are part, first are Make/Model. 
        // This is just a placeholder `mock`.

        // In production:
        // const response = await openai.chat.completions.create(...)
        // return JSON.parse(response.choices[0].message.content);

        const words = text.split(' ');
        if (words.length < 2) return { partName: text };

        return {
            make: words[0],
            model: words[1],
            partName: words.slice(2).join(' ')
        };
    }
}
