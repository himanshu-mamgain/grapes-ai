import { Grape, Result } from '../../types';
import { ParseError } from '../../errors';

export class JsonParserGrape implements Grape<string, unknown> {
    async process(input: string): Promise<Result<unknown, Error>> {
        try {
            // Basic cleanup for LLM outputs (removing markdown code blocks)
            const cleanInput = input.replace(/```json\n?|\n?```/g, '').trim();
            const parsed: unknown = JSON.parse(cleanInput);
            return { success: true, data: parsed };
        } catch (error) {
            return {
                success: false,
                error: new ParseError(`Failed to parse JSON: ${(error as Error).message}`),
            };
        }
    }
}
