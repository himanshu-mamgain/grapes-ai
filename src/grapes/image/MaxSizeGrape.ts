import { Grape, Result } from '../../types';
import { ImageMetadata } from './types';

export class MaxSizeGrape implements Grape<ImageMetadata, ImageMetadata> {
    constructor(private maxWidth: number, private maxHeight: number) { }

    async process(input: ImageMetadata): Promise<Result<ImageMetadata, Error>> {
        // In a real implementation, this would actually resize the buffer.
        // Here, we just return a "simulated" resize or pass-through if valid.

        // For this lightweight version, we are acting as a Validator. 
        // If we were a Transformer, we would return a new ImageMetadata with corrected dimensions.

        // Let's assume this is a pure logic check for now, or returns a "clean" metadata object.
        const output = { ...input };
        if (output.width > this.maxWidth) output.width = this.maxWidth;
        if (output.height > this.maxHeight) output.height = this.maxHeight;

        return { success: true, data: output };
    }
}
