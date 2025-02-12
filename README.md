# TsFluent 🎖️

[![CI](https://github.com/Adedoyin-Emmanuel/tsresult/actions/workflows/ci.yml/badge.svg)](https://github.com/Adedoyin-Emmanuel/tsresult/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/tsfluent.svg)](https://badge.fury.io/js/tsfluent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful and fluent Result type implementation for TypeScript, providing a clean and expressive way to handle success and failure states in your code.

## Features ✨

- 🎯 Type-safe Result handling
- 🔄 Chainable fluent API
- ⚡ Async support with Result promises
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

// Checking result state
if (success.isOk()) {
  console.log(success.getValue()); // "Hello, World!"
}

if (failure.isFail()) {
  console.log(failure.getError()); // "Something went wrong"
}
```

### Chaining Operations

```typescript
const result = Result.ok(5)
  .map((value) => value * 2)
  .flatMap((value) => Result.ok(value + 3))
  .mapError((error) => `Processed error: ${error}`);

// Access the final value
if (result.isOk()) {
  console.log(result.getValue()); // 13
}
```

### Async Operations

```typescript
const asyncResult = await Result.fromAsync(async () => {
  const response = await fetch("https://api.example.com/data");
  if (!response.ok) throw new Error("API request failed");
  return response.json();
});

// Handle the result
if (asyncResult.isOk()) {
  const data = asyncResult.getValue();
  // Process data
} else {
  console.error(asyncResult.getError());
}
```

### Error Handling

```typescript
const result = Result.try(() => {
  // Some code that might throw
  throw new Error("Oops!");
});

// Handle errors gracefully
if (result.isFail()) {
  console.error(result.getError()); // Error: Oops!
}
```

## API Reference 📚

### Result<T, E>

The main Result type that wraps a success value of type T or an error value of type E.

#### Static Methods

- `ok<T>(value: T): Result<T, never>` - Creates a success result
- `fail<E>(error: E): Result<never, E>` - Creates a failure result
- `try<T>(fn: () => T): Result<T, Error>` - Wraps a function that might throw
- `fromAsync<T>(promise: Promise<T>): Promise<Result<T, Error>>` - Wraps an async operation

#### Instance Methods

- `isOk(): boolean` - Checks if result is successful
- `isFail(): boolean` - Checks if result is a failure
- `getValue(): T` - Gets the success value
- `getError(): E` - Gets the error value
- `map<U>(fn: (value: T) => U): Result<U, E>` - Maps success value
- `mapError<F>(fn: (error: E) => F): Result<T, F>` - Maps error value
- `flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>` - Chains results
- `match<U>(onOk: (value: T) => U, onFail: (error: E) => U): U` - Pattern matching

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
