import { JsonParserGrape } from '../src/grapes/text/JsonParserGrape';
import { SchemaValidatorGrape } from '../src/grapes/text/SchemaValidatorGrape';
import { z } from 'zod';

describe('Text Grapes', () => {
    describe('JsonParserGrape', () => {
        const parser = new JsonParserGrape();

        it('should parse valid JSON', async () => {
            const result = await parser.process('{"foo": "bar"}');
            expect(result.success).toBe(true);
            if (result.success) expect(result.data).toEqual({ foo: 'bar' });
        });

        it('should strip markdown code blocks', async () => {
            const mdJson = '```json\n{"foo": "bar"}\n```';
            const result = await parser.process(mdJson);
            expect(result.success).toBe(true);
            if (result.success) expect(result.data).toEqual({ foo: 'bar' });
        });

        it('should fail on invalid JSON', async () => {
            const result = await parser.process('{foo: bar}');
            expect(result.success).toBe(false);
        });
    });

    describe('SchemaValidatorGrape', () => {
        const schema = z.object({ count: z.number() });
        const validator = new SchemaValidatorGrape(schema);

        it('should pass matching data', async () => {
            const result = await validator.process({ count: 123 });
            expect(result.success).toBe(true);
        });

        it('should fail non-matching data', async () => {
            const result = await validator.process({ count: '123' });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.message).toContain('Schema validation failed');
            }
        });
    });
});
