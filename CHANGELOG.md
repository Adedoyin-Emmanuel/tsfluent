# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.5.0](https://github.com/Adedoyin-Emmanuel/tsfluent/compare/v1.3.0...v1.5.0) (2025-02-13)


### Bug Fixes

* fix package configuration ([7570d2f](https://github.com/Adedoyin-Emmanuel/tsfluent/commit/7570d2f4a03443457247c093f7f68e9aea89d8ea))

## [1.4.0](https://github.com/Adedoyin-Emmanuel/tsfluent/compare/v1.3.0...v1.4.0) (2025-02-13)


### Bug Fixes

* fix package configuration ([7570d2f](https://github.com/Adedoyin-Emmanuel/tsfluent/commit/7570d2f4a03443457247c093f7f68e9aea89d8ea))

## [1.4.0](https://github.com/Adedoyin-Emmanuel/tsfluent/compare/v1.3.0...v1.4.0) (2025-02-13)

## [1.3.0](https://github.com/Adedoyin-Emmanuel/tsfluent/compare/v1.2.0...v1.3.0) (2025-02-13)

## [1.2.0](https://github.com/Adedoyin-Emmanuel/tsfluent/compare/v1.1.0...v1.2.0) (2025-02-13)

### Features

- Add generic context type support and rich metadata handling ([ed146df](https://github.com/Adedoyin-Emmanuel/tsfluent/commit/ed146dfb120520d3ec71fbe40599f1b71e5df0c4))

### Added

- 🌟 Generic context type support (`TContext`) for both `Result` and `ResultAsync`
- 🔍 Enhanced metadata handling with type-safe context access
- ✨ Property-based access for errors and metadata (replacing method-based access)
- 🔄 Improved type safety in chaining operations

### Changed

- ⚡ Deprecated `getErrors()` in favor of `errors` property
- 🛠️ Deprecated `getMetadata()` in favor of `metadata` property
- 🔒 Strengthened type safety across all operations
- 📝 Updated documentation with comprehensive examples

### Fixed

- 🐛 Type compatibility issues between `Result` and `ResultAsync`
- 🔧 Metadata propagation in transformation methods
- ✨ Context type preservation in chaining operations

### Example Usage

```typescript
interface UserContext {
  userId: string;
  timestamp: Date;
  environment: "dev" | "prod";
}

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

## [1.1.0](https://github.com/Adedoyin-Emmanuel/tsfluent/compare/v1.0.7...v1.1.0) (2025-02-13)

### [1.0.7](https://github.com/Adedoyin-Emmanuel/tsfluent/compare/v1.0.6...v1.0.7) (2025-02-13)

### [1.0.6](https://github.com/Adedoyin-Emmanuel/tsfluent/compare/v1.0.5...v1.0.6) (2025-02-13)

### [1.0.5](https://github.com/Adedoyin-Emmanuel/tsfluent/compare/v1.0.4...v1.0.5) (2025-02-13)

### [1.0.4](https://github.com/Adedoyin-Emmanuel/tsfluent/compare/v1.0.3...v1.0.4) (2025-02-13)

### [1.0.3](https://github.com/Adedoyin-Emmanuel/tsfluent/compare/v1.0.2...v1.0.3) (2025-02-12)

### [1.0.2](https://github.com/Adedoyin-Emmanuel/tsfluent/compare/v1.0.1...v1.0.2) (2025-02-12)

### [1.0.1](https://github.com/Adedoyin-Emmanuel/tsresult/compare/v1.0.0...v1.0.1) (2025-02-12)

## 1.0.0 (2025-02-12)

### Bug Fixes

- fix failing tests ([10cf8cc](https://github.com/clipsave/tsresult/commit/10cf8ccade360648b8f6a23a5db2d70c215c43a4))
