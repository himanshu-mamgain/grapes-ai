import { Grape, Result } from '../../types';
import { ValidationError } from '../../errors';
import { ZodSchema } from 'zod';

export class SchemaValidatorGrape<T> implements Grape<unknown, T> {
    constructor(private schema: ZodSchema<T>) { }

    async process(input: unknown): Promise<Result<T, Error>> {
        const result = this.schema.safeParse(input);
        if (result.success) {
            return { success: true, data: result.data };
        } else {
            return {
                success: false,
                error: new ValidationError(`Schema validation failed: ${result.error.message}`),
            };
        }
    }
}
