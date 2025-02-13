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
  console.log(result.metadata); // {timestamp: 2025-02-13T10:34:13.928Z, context: { source: "user-input", },}
}
```

### Async Operations

```typescript
import { ResultAsync } from "tsfluent";

interface IUser {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

interface IApiContext {
  requestId: string;
  endpoint: string;
}

// Create an async result from a Promise
const asyncResult = await ResultAsync.from<IUser[]>(
  fetch("https://jsonplaceholder.typicode.com/users").then((res) => res.json())
);

asyncResult.withMetadata({
  context: {
    requestId: "uniquerequestid",
    endpoint: "/users",
  },
});

// Handle the result using properties
if (asyncResult.isSuccess) {
  const data = await asyncResult.value;
  console.log("Response:", data);
} else {
  console.error(asyncResult.errors);
}

// Alternative: Use okAsync directly with context
const resultWithContext = await ResultAsync.okAsync<IUser[], IApiContext>(
  fetch("https://jsonplaceholder.typicode.com/users").then((res) => res.json()),
  {
    metadata: {
      context: {
        requestId: "youruniqueRequestId",
        endpoint: "/users",
      },
    },
  }
);

if (resultWithContext.isSuccess) {
  const users = await resultWithContext.value;

  console.log(users.map((user) => user.name));
}
```

### Error Handling with Context

```typescript
import { AsyncUtils } from "tsfluent";

// Using tryAsync with retry configuration
const result = await AsyncUtils.tryAsync<string>(
  async () => {
    // Some async operation that might fail
    throw new Error("Oops!");
  },
  3, // maxAttempts
  1000, // delayMs
  2000 // timeoutMs (optional)
);

// Handle errors with retry information
if (result.isFailure) {
  console.error(result.errors); // Array of errors with timestamps
  const context = result.errors[0].context; // Access retry context
  if (context) {
    console.log(
      `Failed after ${context.attempts} of ${context.maxAttempts} attempts`
    );
    console.log(`Delay between attempts: ${context.delayMs}ms`);
    if (context.timeoutMs) {
      console.log(`Operation timed out after ${context.timeoutMs}ms`);
    }
  }
}
```

### ResultAsync Operations

```typescript
import { ResultAsync } from "tsfluent";

interface ApiContext {
  requestId: string;
  endpoint: string;
  timestamp: Date;
}

// Create a successful async result with context
const result = await ResultAsync.okAsync<Response, ApiContext>(
  fetch("https://api.example.com/data"),
  {
    metadata: {
      context: {
        requestId: "req-123",
        endpoint: "/data",
        timestamp: new Date(),
      },
    },
  }
);

// Chain operations with type safety
const processedResult = await result
  .map((response) => response.json()) // Transform the value
  .onSuccess(async (data) => {
    console.log("Data processed:", data);
    console.log("Request ID:", result.metadata?.context?.requestId);
  })
  .onFailure((errors) => {
    console.error("Failed:", errors);
    // Context is preserved in errors
    console.log("Failed endpoint:", errors[0].context?.endpoint);
  });

// Convert to synchronous Result
const syncResult = await result.toResult();
```

### Combining Results

```typescript
import { ResultAsync, AsyncUtils } from "tsfluent";

// Combine multiple async results
const results = [
  ResultAsync.okAsync(fetchUser(1)),
  ResultAsync.okAsync(fetchUser(2)),
  ResultAsync.okAsync(fetchUser(3)),
];

const combined = await AsyncUtils.combine(results);

if (combined.isSuccess) {
  const users = await combined.value; // Array of users
  console.log("All users fetched:", users);
} else {
  console.error("Some fetches failed:", combined.errors);
}

// Using merge for sync results
const syncResults = [Result.ok(1), Result.ok(2), Result.ok(3)];

const merged = Result.merge(syncResults);
console.log(merged.value); // [1, 2, 3]
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

- `ok<T, TContext>(value: T, options?: IResultOptions<TContext>): Result<T, TContext>` - Creates a success result
- `fail<T, TContext>(error: string | IError | IError[]): Result<T, TContext>` - Creates a failure result
- `merge<T, TContext>(results: Result<T, TContext>[]): Result<T[], TContext>` - Merges multiple results

#### Instance Methods

- `withError(error: string | IError): Result<T, TContext>` - Adds an error
- `withSuccess(success: string | ISuccess): Result<T, TContext>` - Adds a success message
- `withValue(value: T): Result<T, TContext>` - Sets the value
- `withMetadata(metadata: IResultMetadata<TContext>): Result<T, TContext>` - Adds metadata
- `withContext(context: Record<string, unknown>): Result<T, TContext>` - Adds context to the last error
- `toPromise(): Promise<T>` - Converts to a Promise

### ResultAsync<T, TContext>

Asynchronous version of Result with Promise support and context type.

#### Properties

- `isSuccess: boolean` - Whether the result is successful
- `isFailure: boolean` - Whether the result is a failure
- `value: Promise<T>` - Gets the success value (throws if accessing on failure)
- `errors: IError[]` - Gets the array of errors
- `metadata?: IResultMetadata<TContext>` - Gets the metadata with typed context

#### Static Methods

- `okAsync<T, TContext>(value: T | Promise<T>, options?: IResultOptions<TContext>): Promise<ResultAsync<T, TContext>>` - Creates a success result
- `failAsync<T, TContext>(error: string | IError | IError[]): Promise<ResultAsync<T, TContext>>` - Creates a failure result
- `from<T>(promise: Promise<Result<T> | T>): Promise<ResultAsync<T>>` - Creates from a Promise
- `fromResult<T, TContext>(result: Result<T, TContext>): ResultAsync<T, TContext>` - Creates from a Result
- `merge<T, TContext>(results: ResultAsync<T, TContext>[]): Promise<ResultAsync<T[], TContext>>` - Merges multiple results

#### Instance Methods

- `withError(error: string | IError): ResultAsync<T, TContext>` - Adds an error
- `withSuccess(success: string | ISuccess): ResultAsync<T, TContext>` - Adds a success message
- `withValue(value: T | Promise<T>): Promise<ResultAsync<T, TContext>>` - Sets the value
- `withMetadata(metadata: IResultMetadata<TContext>): ResultAsync<T, TContext>` - Adds metadata
- `withContext(context: Record<string, unknown>): ResultAsync<T, TContext>` - Adds context to the last error
- `toResult(): Promise<Result<T, TContext>>` - Converts to a synchronous Result
- `map<U>(func: (value: T) => Promise<U> | U): Promise<ResultAsync<U, TContext>>` - Maps the value
- `bind<U>(func: (value: T) => Promise<ResultAsync<U, TContext>>): Promise<ResultAsync<U, TContext>>` - Chains results
- `tap(action: (value: T) => void | Promise<void>): Promise<ResultAsync<T, TContext>>` - Executes side effects
- `onSuccess(callback: (value: T) => void | Promise<void>): Promise<ResultAsync<T, TContext>>` - Success callback
- `onFailure(callback: (errors: IError[]) => void | Promise<void>): Promise<ResultAsync<T, TContext>>` - Failure callback

### AsyncUtils

Utility class for working with asynchronous operations.

#### Static Methods

- `try<T>(action: () => Promise<T>, options?: IResultOptions): Promise<Result<T>>` - Wraps an async operation
- `tryAsync<T>(action: () => Promise<T>, maxAttempts?: number, delayMs?: number, timeoutMs?: number): Promise<Result<T>>` - Retries an async operation with timeout
- `combine<T>(asyncResults: ResultAsync<T>[], options?: IResultOptions): Promise<ResultAsync<T[]>>` - Combines multiple results
- `timeout<T>(action: () => Promise<T>, timeoutMs: number): Promise<Result<T>>` - Executes with timeout
- `retry<T>(action: () => Promise<T>, retries?: number, delay?: number): Promise<Result<T>>` - Retries with delay

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
