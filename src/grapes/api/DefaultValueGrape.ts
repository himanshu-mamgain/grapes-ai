import { Grape, Result } from '../../types';

export class DefaultValueGrape<T> implements Grape<Record<string, unknown>, Record<string, unknown>> {
    constructor(private key: string, private defaultValue: T) { }

    async process(input: Record<string, unknown>): Promise<Result<Record<string, unknown>, Error>> {
        const output = { ...input };
        if (output[this.key] === undefined || output[this.key] === null) {
            output[this.key] = this.defaultValue;
        }
        return { success: true, data: output };
    }
}
