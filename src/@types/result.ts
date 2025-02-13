import type { Result } from "../result";

/**
 * Represents the possible states of a Result object.
 */
export type ResultStatus = "success" | "failure";

/**
 * Generic metadata type for storing additional information.
 * Can contain any key-value pairs where values are of unknown type.
 */
export interface IMetadata {
  [key: string]: unknown;
}

/**
 * Represents an error in the Result object.
 * Contains detailed information about what went wrong.
 */
export interface IError {
  /** The error message describing what went wrong */
  message: string;
  /** Optional metadata associated with the error */
  metadata?: IMetadata;
  /** The original error or another IError that caused this error */
  causedBy?: Error | IError;
  /** Optional code identifying the type/reason of the error */
  reasonCode?: string;
  /** Additional contextual information about the error */
  context?: Record<string, unknown>;
  /** When the error occurred */
  timestamp?: Date;
}

/**
 * Represents a success message in the Result object.
 * Used to track successful operations or steps.
 */
export interface ISuccess {
  /** Optional success message */
  message?: string;
  /** Optional metadata associated with the success */
  metadata?: IMetadata;
  /** Additional contextual information about the success */
  context?: Record<string, unknown>;
  /** When the success occurred */
  timestamp?: Date;
}

/**
 * Utility type to extract the value type from a Result instance.
 *
 * @template T - The type to extract from
 * @example
 * ```typescript
 * type UserResult = Result<User>;
 * type User = ResultValueType<UserResult>; // Extracts User type
 * ```
 */
export type ResultValueType<T> = T extends Result<infer U> ? U : never;

/**
 * Metadata structure for Result objects.
 * Used to attach additional information to Results.
 */
export interface IResultMetadata<TContext = Record<string, unknown>> {
  /** Optional metadata key-value pairs */
  metadata?: IMetadata;
  /** Optional message describing the metadata */
  message?: string;
  /** Additional contextual information */
  context?: TContext;
  /** When the metadata was created */
  timestamp?: Date;
}

/**
 * Configuration options for Result objects.
 * Controls behavior of error handling and value retrieval.
 */
export interface IResultOptions<TContext = Record<string, unknown>> {
  /** Whether to return a default value when in failure state instead of throwing */
  defaultValueWhenFailure?: boolean;
  /** Whether to preserve the order of errors (true) or reverse them (false) */
  preserveErrorsOrder?: boolean;
  /** Optional metadata to attach to the Result */
  metadata?: IResultMetadata<TContext>;
}
