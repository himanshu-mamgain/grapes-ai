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

1.  **Deterministic First**: We prefer regex, schema validation, and code-based logic over "asking an LLM to fix it."
2.  **Model Agnostic**: Works with OpenAI, Anthropic, local models, or standard REST APIs.
3.  **Explicit Failure**: We prefer crashing the pipeline over guessing the user's intent. Silent failures are the enemy.
4.  **Removable**: Every Grape is isolated. If a validation rule changes, swap the Grape.

## Limitations

- **No Semantic Truth**: `grapes-ai` cannot tell you if a generated summary is *accurate*, only that it is *grammatically correct* or *fits a length constraint*.
- **Linear Complexity**: Pipelines are designed for linear transformations. Complex branching logic logic should be handled in your application code, not creating "spaghetti grapes."

## Roadmap

- **Q1**: Core TypeScript interfaces and basic Validator Grapes (JSON, Regex).
- **Q2**: Image processing Grapes (using `sharp` or similar).
- **Q3**: "Heal" Grapes (optional LLM call to fix broken JSON).

---
*Maintained by the Open Source Engineering Community.*