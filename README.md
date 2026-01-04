# grapes-ai

**A post-processing and transformation plugin framework for AI outputs and API responses.**

`grapes-ai` is a lightweight, chainable processing pipeline designed to validate, repair, and transform data. It is built for engineering teams who need deterministic guarantees when working with probabilistic AI outputs.

## What is grapes-ai?

It is a framework for building "Grapes"—single-purpose logical units that sit between your raw data source (LLM, API, database) and your application logic.

Each Grape:
- **Validates**: Checks if data meets specific criteria (e.g., schema, aspect ratio).
- **Enforces**: Mutates data to satisfy constraints (e.g., resizing images, casting types).
- **Transforms**: Converts data into your required format.
- **Fails**: Provides explicit failure signals when constraints cannot be met.

## What grapes-ai is NOT

- **NOT an Agent Framework**: It does not plan, reason, or operate autonomously. It follows a strict linear pipeline.
- **NOT a "Fact Checker"**: It cannot verify if an AI's statement is true. It can only verify if the output matches a specific structure or format.
- **NOT a Model Trainer**: It operates purely on the output side.
- **NOT Magic**: It relies on defined engineering rules/schema, not "AI reasoning" to fix problems.

## Core Concepts

### 1. Grape
A small, functional module.
```typescript
interface Grape<Input, Output> {
  process(input: Input): Promise<Result<Output, GrapeError>>;
}
```

### API Reference

#### The `Result` Type
We strictly avoid throwing Errors for control flow. All Grapes must return a `Result`.

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }       // Operation succeeded
  | { success: false; error: E };    // Operation failed explicitly
```

This discriminative union forces you to handle both cases. accessing `.data` is only allowed if `success` is true.

#### Error Propagation
- **Fatal**: If a Grape returns `success: false`, the **Pipeline halts immediately**.
- **Recoverable**: If you need to recover, you must handle the logic *outside* the pipeline or use a specific "RetryGrape" (planned) that wraps another Grape.

### 2. Pipeline
A linear chain of Grapes. Data flows through sequentially. If any Grape fails, the pipeline halts (or falls back, depending on configuration).

### 3. Failure
Errors are first-class citizens. A pipeline returning a failure is a valid state, allowing your application to trigger fallbacks or retries deterministically.

## Installation

```bash
npm install grapes-ai
```

## Usage Examples

### 1. Text Post-Processing (JSON Schema Enforcement)

Ensure an LLM response is valid JSON and adheres to a specific schema.

```typescript
import { Pipeline, JsonParserGrape, SchemaValidatorGrape } from 'grapes-ai';
import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  username: z.string(),
});

const pipeline = new Pipeline()
  .add(new JsonParserGrape())            // String -> Object
  .add(new SchemaValidatorGrape(userSchema)); // Object -> Typed User

async function handleLlmOutput(rawString: string) {
  const result = await pipeline.run(rawString);

  if (result.success) {
    console.log("Valid User:", result.data);
  } else {
    console.error("Validation Failed:", result.error);
    // Explicitly handle failure (e.g., retry LLM call)
  }
}
```

### 2. API Transformation

Normalize "messy" API data into a clean internal type.

```typescript
import { Pipeline, RenameKeyGrape, TypeCastGrape } from 'grapes-ai';

const apiPipeline = new Pipeline()
  .add(new RenameKeyGrape('user_id', 'userId'))
  .add(new TypeCastGrape('userId', 'number'))
  .add(new DefaultValueGrape('isActive', false));

const cleanData = await apiPipeline.run(externalApiData);
```

### 3. Image Post-Processing

Validate and standardize image assets before storage.

```typescript
import { Pipeline, AspectRatioGrape, MaxSizeGrape } from 'grapes-ai';

const imagePipeline = new Pipeline()
  .add(new AspectRatioGrape(16 / 9, { tolerance: 0.05 })) // Fails if not close to 16:9
  .add(new MaxSizeGrape(1920, 1080)); // Downscales if larger

const processedImage = await imagePipeline.run(uploadedBuffer);
```

## Design Philosophy

### 1. Deterministic First, AI Second
We trust code more than probabilities.
- **Why?** LLMs are non-deterministic. If you ask an LLM to "fix this JSON," it might fix it 99 times and hallucinate a new key the 100th time.
- **Approach**: Always use regex, strict schema validation (Zod), or algorithmic repair *first*. Only use checking models as a last resort "Heal Grape."

### 2. Explicit Failures > Silent Guesses
A pipeline should crash loudly rather than pass bad data.
- **Failures Propagate**: A failure in the first Grape stops the entire chain immediately.
- **Signal**: We return a `{ success: false, error: Error }` Result type. We never `throw` exceptions for expected validation failures; we return them as values.

### 3. Isolated & Chainable
Big logic is bad logic.
- **Small Grapes**: A Grape should do *one* thing (e.g., "Check Aspect Ratio").
- **Composable**: If a rule changes, you remove one Grape, not rewrite a monolithic function.

## Limitations

- **No Semantic Truth**: `grapes-ai` cannot tell you if a generated summary is *accurate*, only that it is *grammatically correct* or *fits a length constraint*.
- **Linear Complexity**: Pipelines are designed for linear transformations. Complex branching logic logic should be handled in your application code, not creating "spaghetti grapes."
- **Misuse of Fallbacks**:
  - **Anti-Pattern**: Using an LLM to "fix" a date format that could be fixed with `Date.parse()`.
  - **Rule**: Never call an LLM if you can fix it with deterministic logic. Use "Healer Grapes" only when schema validation fails explicitly and no algorithmic fix is possible.

## Contributing

We welcome pull requests that align with our deterministic philosophy.

### Standards for New Grapes
1.  **Single Responsibility**: A Grape must do exactly one thing.
2.  **No Side Effects**: Grapes should be pure functions of their input where possible (or idempotent).
3.  **Strict Typing**: We enforce `noImplicitAny`.
    - ❌ `process(input: any)`
    - ✅ `process(input: unknown)` or `process(input: string)`
4.  **Testing**:
    - Must include `.test.ts`.
    - Must test **success** (happy path) AND **failure** (edge cases).

### Testing & Linting
- **Test every Grape**: Create a matching `.test.ts` file in `tests/`.
- **Coverage**: run `npm test` to ensure no regressions.
- **Lint**: Code must pass `tsc` with strict settings enabled.

## Available Grapes

| Module | Grape | Input | Output | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Text** | `JsonParserGrape` | `string` | `unknown` | Safely parses JSON string |
| **Text** | `SchemaValidatorGrape` | `unknown` | `T` | Validates against Zod schema |
| **API** | `RenameKeyGrape` | `Record` | `Record` | Renames object keys |
| **API** | `TypeCastGrape` | `Record` | `Record` | Casts values to primitives |
| **Image**| `AspectRatioGrape` | `ImageMetadata` | `ImageMetadata` | Validation only |

## Roadmap

- ✅ **Core Engine**: TypeScript interfaces, Pipeline logic, and explicit Result types.
- ✅ **Text Grapes**: JSON parsing, Zod schema validation.
- ✅ **API Grapes**: Key renaming, Type casting, Default values.
- ⚡ **Image Processing**: (Planned) `sharp` integration for resizing, aspect ratio, and format conversion.
- 🧠 **Healer Grapes**: (Planned) Optional LLM-based repair for broken JSON. *Philosophy: Must be less trusted than deterministic steps and only run on explicit failure.*

---
*Maintained by the Open Source Engineering Community.*