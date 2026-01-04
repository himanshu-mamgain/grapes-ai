import { Pipeline } from '../src/Pipeline';
import { Grape, Result } from '../src/types';

class MultiplyGrape implements Grape<number, number> {
    constructor(private factor: number) { }
    async process(input: number): Promise<Result<number, Error>> {
        return { success: true, data: input * this.factor };
    }
}

class FailGrape implements Grape<unknown, unknown> {
    async process(input: unknown): Promise<Result<unknown, Error>> {
        return { success: false, error: new Error('Intentional Failure') };
    }
}

describe('Pipeline Engine', () => {
    it('should execute a chain of grapes sequentially', async () => {
        const pipeline = new Pipeline<number, number>()
            .add(new MultiplyGrape(2))
            .add(new MultiplyGrape(3));

        const result = await pipeline.run(2);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe(12); // 2 * 2 * 3
        }
    });

    it('should short-circuit on failure', async () => {
        const pipeline = new Pipeline<number, number>()
            .add(new MultiplyGrape(2))
            .add(new FailGrape())
            .add(new MultiplyGrape(3));

        const result = await pipeline.run(5);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.message).toBe('Intentional Failure');
        }
    });

    it('should handle thrown errors safely', async () => {
        const explodingGrape = {
            process: async () => {
                throw new Error('Boom');
            },
        } as Grape<unknown, unknown>;

        const pipeline = new Pipeline<unknown, unknown>().add(explodingGrape);
        const result = await pipeline.run({});

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.message).toBe('Boom');
        }
    });
});
