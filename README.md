# TsFluent 🎖️

[![CI](https://github.com/Adedoyin-Emmanuel/tsfluent/actions/workflows/ci.yml/badge.svg)](https://github.com/Adedoyin-Emmanuel/tsfluent/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/tsfluent.svg)](https://badge.fury.io/js/tsfluent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful and fluent Result type implementation for TypeScript, providing a clean and expressive way to handle success and failure states in your code.

## Features ✨

- 🎯 Type-safe Result handling
- 🔄 Chainable fluent API
- ⚡ Async support with ResultAsync
- 🛡️ Comprehensive error handling
- 📦 Zero dependencies
- 🎨 Clean and expressive syntax
- 🌟 Generic context type support
- 🔍 Rich metadata handling

## Installation 📦

```bash
# Using npm
npm install tsfluent

# Using yarn
yarn add tsfluent

# Using pnpm
pnpm add tsfluent

# Using bun
bun add tsfluent
```

## Usage 🚀

### Basic Usage

```typescript
import { Result } from "tsfluent";

// Creating a success result
const success = Result.ok("Hello, World!");

// Creating a failure result
const failure = Result.fail("Something went wrong");

// Checking result state using properties
if (success.isSuccess) {
  console.log(success.value); // "Hello, World!"
}

if (failure.isFailure) {
  console.log(failure.errors[0].message); // "Something went wrong"
}
```

### Using Generic Context Type

```typescript
// Define your custom context type
interface UserContext {
  userId: string;
  timestamp: Date;
  environment: "dev" | "prod";
}

// Create a result with typed context
const result = Result.ok<number, UserContext>(42).withMetadata({
  context: {
    userId: "123",
    timestamp: new Date(),
    environment: "prod",
  },
});

// Type-safe access to context
const context = result.metadata?.context; // Type is UserContext | undefined
```

### Chaining Operations

```typescript
const result = Result.ok(5)
  .withValue(10)
  .withSuccess("Value updated")
  .withMetadata({
    timestamp: new Date(),
    context: { source: "user-input" },
  });

// Access the final value using property
if (result.isSuccess) {
  console.log(result.value); // 10
  console.log(result.getSuccesses()); // [{message: "Value updated", timestamp: Date}]
}
```

### Async Operations

```typescript
import { ResultAsync } from "tsfluent";

interface ApiContext {
  requestId: string;
  endpoint: string;
}

const asyncResult = await ResultAsync.from<Response, ApiContext>(
  fetch("https://api.example.com/data")
).withMetadata({
  context: {
    requestId: "req-123",
    endpoint: "/data",
  },
});

// Handle the result using properties
if (asyncResult.isSuccess) {
  const data = await asyncResult.value;
  console.log(asyncResult.metadata?.context); // Type-safe access to ApiContext
} else {
  console.error(asyncResult.errors);
}
```

### Error Handling with Context

```typescript
import { AsyncUtils } from "tsfluent";

interface RetryContext {
  attempts: number;
  lastAttempt: Date;
}

const result = await AsyncUtils.tryAsync<string, RetryContext>(
  async () => {
    // Some async operation that might fail
    throw new Error("Oops!");
  },
  3, // max attempts
  1000 // delay between retries in ms
);

// Handle errors gracefully using properties
if (result.isFailure) {
  console.error(result.errors); // Array of errors with timestamps
  console.log(result.metadata?.context); // Access retry context
}
```

## API Reference 📚

### Result<T, TContext>

The main Result type that wraps a success value of type T with an optional context type TContext.

#### Properties

- `isSuccess: boolean` - Whether the result is successful
- `isFailure: boolean` - Whether the result is a failure
- `value: T` - Gets the success value (throws if accessing on failure)
- `errors: IError[]` - Gets the array of errors
- `metadata?: IResultMetadata<TContext>` - Gets the metadata with typed context

#### Static Methods

- `ok<T, TContext>(value: T, metadata?: IResultMetadata<TContext>): Result<T, TContext>` - Creates a success result
- `fail<T, TContext>(error: string | IError | IError[]): Result<T, TContext>` - Creates a failure result
- `merge<T, TContext>(results: Result<T, TContext>[]): Result<T[], TContext>` - Merges multiple results

#### Instance Methods

- `withError(error: string | IError): Result<T, TContext>` - Adds an error
- `withSuccess(success: string | ISuccess): Result<T, TContext>` - Adds a success message
- `withValue(value: T): Result<T, TContext>` - Sets the value
- `withMetadata(metadata: IResultMetadata<TContext>): Result<T, TContext>` - Adds metadata

### ResultAsync<T, TContext>

Asynchronous version of Result with Promise support and context type.

#### Properties

- `isSuccess: boolean` - Whether the result is successful
- `isFailure: boolean` - Whether the result is a failure
- `value: Promise<T>` - Gets the success value (throws if accessing on failure)
- `metadata?: IResultMetadata<TContext>` - Gets the metadata with typed context

#### Static Methods

- `okAsync<T, TContext>(value: T | Promise<T>, metadata?: IResultMetadata<TContext>): Promise<ResultAsync<T, TContext>>` - Creates a success result
- `failAsync<T, TContext>(error: string | IError | IError[]): Promise<ResultAsync<T, TContext>>` - Creates a failure result
- `from<T>(promise: Promise<T>): Promise<ResultAsync<T>>` - Creates from a Promise
- `fromResult<T, TContext>(result: Result<T, TContext>): ResultAsync<T, TContext>` - Creates from a Result

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Adedoyin-Emmanuel/tsresult.git

# Install dependencies
bun install

# Run tests
bun test

# Build the project
bun run build
```

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors ✍️

<a href="https://github.com/Adedoyin-Emmanuel/tsfluent/graphs/contributors">
   <img src="https://contrib.rocks/image?repo=adedoyin-emmanuel/tsfluent&max=100&columns=20&anon=1&size=500" alt="Contributors" />
</a>

## Acknowledgments 🫡

Tsfluent takes heavy inspiration from the following projects:

- [`FluentsResult`](https://github.com/altmann/FluentResults) ([Michael Altmann](https://github.com/altmann))
- [`Neverthrow`](https://github.com/supermacro/neverthrow) ([Giorgio Delgado](https://github.com/supermacro))

## Support 💪

If you find this package helpful, please give it a ⭐️ on [GitHub](https://github.com/Adedoyin-Emmanuel/tsfluent)!
