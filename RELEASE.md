# TsFluent v1.2.0 Release Notes 🎉

## Major Features 🌟

### Generic Context Support

- Added `TContext` generic parameter to both `Result` and `ResultAsync` classes
- Type-safe context handling in metadata and error objects
- Improved type inference in chaining operations
- Better IDE support with accurate type hints

### Property-Based Access

- Introduced direct property access for better developer experience:
  - `result.errors` instead of `getErrors()`
  - `result.metadata` instead of `getMetadata()`
  - Deprecated method-based access in favor of properties

### Enhanced Error Handling

- Improved error context preservation across transformations
- Better retry information in AsyncUtils error context
- Rich metadata support with timestamps and custom contexts

### API Improvements

- Enhanced `ResultAsync.from()` for better Promise handling
- Improved `AsyncUtils.tryAsync()` with configurable retries and timeouts
- Added comprehensive type safety across all operations

## Breaking Changes ⚠️

### Deprecated Methods

- `getErrors()` → use `errors` property instead
- `getMetadata()` → use `metadata` property instead

### Type Changes

- `ResultAsync.from<T>()` now only accepts one generic type parameter
- `AsyncUtils.tryAsync<T>()` simplified to one generic type parameter
- Context types must extend `Record<string, unknown>`

## New Features in Detail 📝

### Result Class

```typescript
// New context support
interface UserContext {
  userId: string;
  environment: "dev" | "prod";
}

const result = Result.ok<number, UserContext>(42).withMetadata({
  context: {
    userId: "123",
    environment: "prod",
  },
});
```

### ResultAsync Class

```typescript
// Improved Promise handling
const result = await ResultAsync.from<Response>(
  fetch("https://api.example.com/data")
);

// Type-safe metadata
result.withMetadata({
  context: {
    requestId: "123",
    endpoint: "/data",
  },
});
```

### AsyncUtils

```typescript
// Enhanced retry configuration
const result = await AsyncUtils.tryAsync(
  async () => {
    // async operation
  },
  3, // maxAttempts
  1000, // delayMs
  2000 // timeoutMs
);
```

## Bug Fixes 🐛

- Fixed type compatibility issues between `Result` and `ResultAsync`
- Corrected metadata propagation in transformation methods
- Resolved context type preservation in chaining operations
- Fixed error context handling in retry operations

## Performance Improvements ⚡

- Optimized error handling chain
- Improved type inference performance
- Better memory usage in retry operations

## Documentation Updates 📚

- Added comprehensive examples for all new features
- Updated API reference with accurate type information
- Improved code samples with real-world use cases
- Added detailed error handling scenarios

## Migration Guide 🔄

### Updating from v1.1.x

1. Replace method calls with property access:

   ```typescript
   // Old
   result.getErrors();
   result.getMetadata();

   // New
   result.errors;
   result.metadata;
   ```

2. Update generic type parameters:

   ```typescript
   // Old
   ResultAsync.from<T, Context>();

   // New
   ResultAsync.from<T>();
   ```

3. Review context types:
   ```typescript
   // Ensure context types extend Record<string, unknown>
   interface YourContext extends Record<string, unknown> {
     // your context properties
   }
   ```

## Contributors 👥

Special thanks to all contributors who helped make this release possible!

## What's Next? 🔮

We're planning several exciting features for upcoming releases:

- Enhanced error categorization
- More utility functions for common patterns
- Additional convenience methods for error handling
- Performance optimizations

## Feedback and Support 💬

We welcome your feedback and contributions! Please:

- Report issues on our [GitHub Issues](https://github.com/Adedoyin-Emmanuel/tsfluent/issues)
- Join discussions in our [GitHub Discussions](https://github.com/Adedoyin-Emmanuel/tsfluent/discussions)
- Submit pull requests for improvements

## License 📄

TsFluent is released under the MIT License. See the LICENSE file for details.
