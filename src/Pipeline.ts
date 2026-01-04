import { Result, Grape } from './types';

export class Pipeline<Input, Output> {
    // We use unknown to avoid explicit 'any', but internally we trust the types managed by add().
    private grapes: Grape<unknown, unknown>[] = [];

    constructor() { }

    /**
     * Adds a new grape to the pipeline.
     * Note: TypeScript cannot easily strictly verify the chain type safety at compile time 
     * for an array of heterogeneous generics without complex recursive types.
     */
    add<NextOutput>(grape: Grape<Output, NextOutput>): Pipeline<Input, NextOutput> {
        // We cast to unknown flavor to store in the array
        this.grapes.push(grape as unknown as Grape<unknown, unknown>);
        // @ts-ignore - casting 'this' to the new type because the pipeline mutates its tail
        return this as unknown as Pipeline<Input, NextOutput>;
    }

    async run(input: Input): Promise<Result<Output, Error>> {
        // Start with input cast to unknown
        let currentData: unknown = input;

        for (const grape of this.grapes) {
            try {
                const result = await grape.process(currentData);
                if (!result.success) {
                    // If we fail, we know the error type matches Result's failure
                    return result as Result<Output, Error>;
                }
                currentData = result.data;
            } catch (err) {
                return {
                    success: false,
                    error: err instanceof Error ? err : new Error(String(err)),
                };
            }
        }

        return { success: true, data: currentData as Output };
    }
}
