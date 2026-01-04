import { RenameKeyGrape } from '../src/grapes/api/RenameKeyGrape';
import { TypeCastGrape } from '../src/grapes/api/TypeCastGrape';
import { DefaultValueGrape } from '../src/grapes/api/DefaultValueGrape';

describe('API Grapes', () => {
    describe('RenameKeyGrape', () => {
        it('should rename a key', async () => {
            const grape = new RenameKeyGrape('old', 'new');
            const result = await grape.process({ old: 1, other: 2 });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({ new: 1, other: 2 });
                expect(result.data['old']).toBeUndefined();
            }
        });
    });

    describe('TypeCastGrape', () => {
        it('should cast string to number', async () => {
            const grape = new TypeCastGrape('val', 'number');
            const result = await grape.process({ val: '123' });
            expect(result.success).toBe(true);
            if (result.success) expect(result.data['val']).toBe(123);
        });

        it('should cast to string', async () => {
            const grape = new TypeCastGrape('val', 'string');
            const result = await grape.process({ val: 123 });
            expect(result.success).toBe(true);
            if (result.success) expect(result.data['val']).toBe('123');
        });
    });

    describe('DefaultValueGrape', () => {
        it('should apply default value if missing', async () => {
            const grape = new DefaultValueGrape('status', 'active');
            const result = await grape.process({});
            expect(result.success).toBe(true);
            if (result.success) expect(result.data['status']).toBe('active');
        });

        it('should not override existing value', async () => {
            const grape = new DefaultValueGrape('status', 'active');
            const result = await grape.process({ status: 'pending' });
            expect(result.success).toBe(true);
            if (result.success) expect(result.data['status']).toBe('pending');
        });
    });
});
