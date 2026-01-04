import { AspectRatioGrape } from '../src/grapes/image/AspectRatioGrape';
import { MaxSizeGrape } from '../src/grapes/image/MaxSizeGrape';
import { ImageMetadata } from '../src/grapes/image/types';

describe('Image Grapes', () => {
    const meta: ImageMetadata = { width: 100, height: 100, format: 'png' };

    describe('AspectRatioGrape', () => {
        it('should pass correct ratio', async () => {
            const grape = new AspectRatioGrape(1, { tolerance: 0.1 });
            const result = await grape.process(meta);
            expect(result.success).toBe(true);
        });

        it('should fail incorrect ratio', async () => {
            const grape = new AspectRatioGrape(16 / 9);
            const result = await grape.process(meta);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.name).toBe('ValidationError');
            }
        });
    });

    describe('MaxSizeGrape', () => {
        it('should clamp dimensions', async () => {
            const grape = new MaxSizeGrape(50, 50);
            const result = await grape.process({ width: 100, height: 20, format: 'png' });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.width).toBe(50);
                expect(result.data.height).toBe(20);
            }
        });
    });
});
