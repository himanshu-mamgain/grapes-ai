import { Grape, Result } from '../../types';
import { ValidationError } from '../../errors';
import { ImageMetadata } from './types';

export class AspectRatioGrape implements Grape<ImageMetadata, ImageMetadata> {
    constructor(private targetRatio: number, private options: { tolerance: number } = { tolerance: 0.01 }) { }

    async process(input: ImageMetadata): Promise<Result<ImageMetadata, Error>> {
        const currentRatio = input.width / input.height;
        const diff = Math.abs(currentRatio - this.targetRatio);

        if (diff > this.options.tolerance) {
            return {
                success: false,
                error: new ValidationError(
                    `Aspect ratio mismatch. Expected ${this.targetRatio}, got ${currentRatio} (tolerance: ${this.options.tolerance})`
                ),
            };
        }

        return { success: true, data: input };
    }
}
