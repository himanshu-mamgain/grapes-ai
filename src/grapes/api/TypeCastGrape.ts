import { Grape, Result } from '../../types';

export class TypeCastGrape implements Grape<Record<string, unknown>, Record<string, unknown>> {
    constructor(private key: string, private type: 'number' | 'string' | 'boolean') { }

    async process(input: Record<string, unknown>): Promise<Result<Record<string, unknown>, Error>> {
        const output = { ...input };
        const value = output[this.key];

        if (value === undefined) return { success: true, data: output };

        if (this.type === 'number') {
            const num = Number(value);
            if (!isNaN(num)) {
                output[this.key] = num;
            }
        } else if (this.type === 'string') {
            output[this.key] = String(value);
        } else if (this.type === 'boolean') {
            output[this.key] = Boolean(value);
        }

        return { success: true, data: output };
    }
}
