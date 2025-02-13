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
  console.log(failure.getErrors()[0].message); // "Something went wrong"
}
```

### Chaining Operations

```typescript
const result = Result.ok(5)
  .withValue(10)
  .withSuccess("Value updated")
  .withMetadata({ timestamp: new Date() });

// Access the final value using property
if (result.isSuccess) {
  console.log(result.value); // 10
  console.log(result.getSuccesses()); // [{message: "Value updated", timestamp: Date}]
}
```

### Async Operations

```typescript
import { ResultAsync } from "tsfluent";

const asyncResult = await ResultAsync.from(
  fetch("https://api.example.com/data").then((r) => r.json())
);

// Handle the result using properties
if (asyncResult.isSuccess) {
  const data = await asyncResult.value;
  // Process data
} else {
  console.error(asyncResult.getErrors());
}
```

### Error Handling

```typescript
import { AsyncUtils } from "tsfluent";

const result = await AsyncUtils.tryAsync(
  async () => {
    // Some async operation that might fail
    throw new Error("Oops!");
  },
  3, // max attempts
  1000 // delay between retries in ms
);

// Handle errors gracefully using properties
if (result.isFailure) {
  console.error(result.getErrors()); // Array of errors with timestamps
}
```

## API Reference 📚

### Result<T>

The main Result type that wraps a success value of type T.

#### Properties

- `isSuccess: boolean` - Whether the result is successful
- `isFailure: boolean` - Whether the result is a failure
- `value: T` - Gets the success value (throws if accessing on failure)

#### Static Methods

- `ok<T>(value: T): Result<T>` - Creates a success result
- `fail(error: string | IError | IError[]): Result<T>` - Creates a failure result
- `merge<T>(results: Result<T>[]): Result<T[]>` - Merges multiple results

#### Instance Methods

- `getErrors(): IError[]` - Gets the array of errors
- `withError(error: string | IError): Result<T>` - Adds an error
- `withSuccess(success: string | ISuccess): Result<T>` - Adds a success message
- `withValue(value: T): Result<T>` - Sets the value
- `withMetadata(metadata: IResultMetadata): Result<T>` - Adds metadata

### ResultAsync<T>

Asynchronous version of Result with Promise support.

#### Properties

- `isSuccess: boolean` - Whether the result is successful
- `isFailure: boolean` - Whether the result is a failure
- `value: Promise<T>` - Gets the success value (throws if accessing on failure)

#### Static Methods

- `okAsync<T>(value: T | Promise<T>): Promise<ResultAsync<T>>` - Creates a success result
- `failAsync(error: string | IError | IError[]): Promise<ResultAsync<T>>` - Creates a failure result
- `from<T>(promise: Promise<T>): Promise<ResultAsync<T>>` - Creates from a Promise
- `fromResult<T>(result: Result<T>): ResultAsync<T>` - Creates from a Result

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

## Author ✍️

Adedoyin Emmanuel Adeniyi

## Support 💪

If you find this package helpful, please give it a ⭐️ on [GitHub](https://github.com/Adedoyin-Emmanuel/tsresult)!
