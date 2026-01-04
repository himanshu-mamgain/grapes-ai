import { Grape, Result } from '../../types';

export class RenameKeyGrape implements Grape<Record<string, unknown>, Record<string, unknown>> {
    constructor(private oldKey: string, private newKey: string) { }

    async process(input: Record<string, unknown>): Promise<Result<Record<string, unknown>, Error>> {
        const output = { ...input };
        if (Object.prototype.hasOwnProperty.call(output, this.oldKey)) {
            output[this.newKey] = output[this.oldKey];
            delete output[this.oldKey];
        }
        return { success: true, data: output };
    }
}
