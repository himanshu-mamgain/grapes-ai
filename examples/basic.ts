import { Pipeline } from '../src/Pipeline';
import { JsonParserGrape } from '../src/grapes/text/JsonParserGrape';
import { SchemaValidatorGrape } from '../src/grapes/text/SchemaValidatorGrape';
import { z } from 'zod';

const userSchema = z.object({
    id: z.number(),
    username: z.string(),
    active: z.boolean(),
});

type User = z.infer<typeof userSchema>;

async function main() {
    console.log('--- Grapes AI Basic Example ---');

    const pipeline = new Pipeline<string, string>()
        .add(new JsonParserGrape())
        .add(new SchemaValidatorGrape(userSchema));

    // Case 1: Valid Input
    const validJson = `
    \`\`\`json
    { "id": 123, "username": "htmx_fan", "active": true }
    \`\`\`
  `;
    console.log('\nRunning Valid Input...');
    const result1 = await pipeline.run(validJson);
    if (result1.success) {
        console.log('✅ Success:', result1.data);
    } else {
        console.error('❌ Fail:', result1.error);
    }

    // Case 2: Invalid Input (Bad Schema)
    const invalidJson = `{ "id": "not_a_number", "username": "htmx_fan" }`;
    console.log('\nRunning Invalid Input (Schema Error)...');
    const result2 = await pipeline.run(invalidJson);
    if (result2.success) {
        console.log('✅ Success:', result2.data);
    } else {
        console.error('❌ Expected Failure:', result2.error.message);
    }

    // Case 3: Invalid Input (Bad JSON)
    const brokenJson = `{ "id": 123, username" }`;
    console.log('\nRunning Invalid Input (JSON Error)...');
    const result3 = await pipeline.run(brokenJson);
    if (result3.success) {
        console.log('✅ Success:', result3.data);
    } else {
        console.error('❌ Expected Failure:', result3.error.message);
    }
}

main();
