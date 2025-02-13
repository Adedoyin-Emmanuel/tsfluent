import type {
  IError,
  ISuccess,
  IResultOptions,
  IResultMetadata,
} from "./@types/result";
import { Result } from "./result";

/**
 * Represents an asynchronous Result monad that handles both success and failure cases.
 * This class is designed to work with Promises and async operations while maintaining
 * the same functional programming principles as the synchronous Result class.
 *
 * @template T - The type of the value contained in the Result
 * @template TContext - The type of the context associated with the Result
 * @example
 * ```typescript
 * const result = await ResultAsync.ok(fetchUserData());
 * const processedResult = await result
 *   .map(user => processUser(user))
 *   .onSuccess(user => console.log('User processed:', user))
 *   .onFailure(errors => console.error('Failed:', errors));
 * ```
 */
export class ResultAsync<T = void, TContext = Record<string, unknown>> {
  private _isSuccess: boolean;
  private _value?: Promise<T>;
  private _errors: IError[] = [];
  private readonly _successes: ISuccess[] = [];
  private _metadata?: IResultMetadata<TContext>;
  private readonly _options: IResultOptions<TContext> = {
    defaultValueWhenFailure: false,
    preserveErrorsOrder: true,
  };

  /**
   * Protected constructor to create a new ResultAsync instance.
   * Use static factory methods `ok()` or `fail()` to create instances.
   *
   * @param value - The value to store in the Result
   * @param options - Configuration options for the Result
   */
  protected constructor(
    value?: T | Promise<T>,
    options?: IResultOptions<TContext>
  ) {
    this._isSuccess = true;

    if (value instanceof Promise) {
      this._value = value;
    } else {
      this._value = Promise.resolve(value as T);
    }

    if (options) {
      this._options = { ...this._options, ...options };
      if (options.metadata) {
        this._metadata = {
          ...options.metadata,
          timestamp: options.metadata.timestamp || new Date(),
        };
      }
    }
  }

  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * Creates a successful Result with the given value.
   *
   * @template T - The type of the value
   * @param value - The value to store in the Result
   * @returns A Promise of a new successful ResultAsync instance
   */
  static async okAsync<T, TContext = Record<string, unknown>>(
    value?: T | Promise<T>
  ): Promise<ResultAsync<T, TContext>>;
  /**
   * Creates a successful Result with the given value and metadata.
   *
   * @template T - The type of the value
   * @param value - The value to store in the Result
   * @param metadata - Metadata to attach to the Result
   * @returns A Promise of a new successful ResultAsync instance
   */
  static async okAsync<T, TContext = Record<string, unknown>>(
    value: T | Promise<T>,
    metadata: IResultMetadata<TContext>
  ): Promise<ResultAsync<T, TContext>>;
  /**
   * Creates a successful Result with the given value and options.
   *
   * @template T - The type of the value
   * @param value - The value to store in the Result
   * @param options - Configuration options for the Result
   * @returns A Promise of a new successful ResultAsync instance
   */
  static async okAsync<T, TContext = Record<string, unknown>>(
    value: T | Promise<T>,
    options: IResultOptions<TContext>
  ): Promise<ResultAsync<T, TContext>>;
  static async okAsync<T, TContext = Record<string, unknown>>(
    value?: T | Promise<T>,
    metadataOrOptions?: IResultMetadata<TContext> | IResultOptions<TContext>
  ): Promise<ResultAsync<T, TContext>> {
    if (!metadataOrOptions) {
      return new ResultAsync<T, TContext>(value);
    }

    if ("metadata" in metadataOrOptions) {
      return new ResultAsync<T, TContext>(
        value,
        metadataOrOptions as IResultOptions<TContext>
      );
    }

    return new ResultAsync<T, TContext>(value, {
      metadata: metadataOrOptions as IResultMetadata<TContext>,
    });
  }

  /**
   * Creates a failed Result with the given error message.
   *
   * @template T - The type of the value
   * @param errorMessage - The error message
   * @returns A Promise of a new failed ResultAsync instance
   */
  static async failAsync<T, TContext = Record<string, unknown>>(
    errorMessage: string
  ): Promise<ResultAsync<T, TContext>>;
  /**
   * Creates a failed Result with the given error object.
   *
   * @template T - The type of the value
   * @param error - The error object
   * @returns A Promise of a new failed ResultAsync instance
   */
  static async failAsync<T, TContext = Record<string, unknown>>(
    error: IError
  ): Promise<ResultAsync<T, TContext>>;
  /**
   * Creates a failed Result with the given array of errors.
   *
   * @template T - The type of the value
   * @param errors - Array of error objects
   * @returns A Promise of a new failed ResultAsync instance
   */
  static async failAsync<T, TContext = Record<string, unknown>>(
    errors: IError[]
  ): Promise<ResultAsync<T, TContext>>;
  static async failAsync<T, TContext = Record<string, unknown>>(
    error: string | IError | IError[],
    metadata?: IResultMetadata<TContext>
  ): Promise<ResultAsync<T, TContext>> {
    const result = new ResultAsync<T, TContext>(undefined, { metadata });
    result._isSuccess = false;

    if (Array.isArray(error)) {
      error.forEach((e) => result.addError(e));
    } else {
      result.addError(typeof error === "string" ? { message: error } : error);
    }

    return result;
  }

  /**
   * Merges multiple ResultAsync instances into a single ResultAsync containing an array of values.
   * If any Result is a failure, the merged Result will be a failure containing all errors.
   *
   * @template T - The type of the values
   * @param results - Array of ResultAsync instances to merge
   * @returns A Promise of a new ResultAsync instance containing an array of values
   */
  static async merge<T, TContext = Record<string, unknown>>(
    results: ResultAsync<T, TContext>[]
  ): Promise<ResultAsync<T[], TContext>> {
    const mergedResult = new ResultAsync<T[], TContext>();
    const valuePromises: Promise<T>[] = [];
    let hasErrors = false;

    for (const result of results) {
      if (result.isSuccess && result._value !== undefined) {
        valuePromises.push(result._value);
      }
      if (result.isFailure) {
        hasErrors = true;
        result._errors.forEach((error) => mergedResult.addError(error));
      }
      result._successes.forEach((success) => mergedResult.addSuccess(success));
    }

    if (hasErrors) {
      mergedResult._isSuccess = false;
      mergedResult._value = Promise.resolve([]);
    } else {
      mergedResult._value = Promise.all(valuePromises);
    }

    return mergedResult;
  }

  /**
   * Creates a ResultAsync from a synchronous Result instance.
   *
   * @template T - The type of the value
   * @param result - The synchronous Result to convert
   * @returns A new ResultAsync instance
   */
  static fromResult<T, TContext = Record<string, unknown>>(
    result: Result<T, TContext>
  ): ResultAsync<T, TContext> {
    const asyncResult = new ResultAsync<T, TContext>(
      result.isSuccess ? result.value : undefined
    );

    if (result.isFailure) {
      asyncResult._isSuccess = false;
      result.errors.forEach((error) => asyncResult.addError(error));
    }

    result.getSuccesses().forEach((success) => asyncResult.addSuccess(success));
    const metadata = result.metadata;
    if (metadata) {
      asyncResult.withMetadata(metadata);
    }
    return asyncResult;
  }

  /**
   * Creates a ResultAsync from a Promise that resolves to a Result or any value.
   * If the promise rejects, it will be captured as a failure.
   *
   * @template T - The type of the value
   * @param promise - Promise that resolves to a Result or value
   * @returns A Promise of a new ResultAsync instance
   */
  static async from<T>(
    promise: Promise<Result<T> | T>
  ): Promise<ResultAsync<T>> {
    try {
      const result = await promise;
      if (result instanceof Result) {
        return ResultAsync.fromResult(result);
      }
      return ResultAsync.okAsync(result);
    } catch (error) {
      return ResultAsync.failAsync({
        message: error instanceof Error ? error.message : "Promise rejected",
        causedBy: error instanceof Error ? error : undefined,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Gets the value contained in the Result.
   * Throws an error if the Result is in a failure state and defaultValueWhenFailure is false.
   *
   * @returns Promise resolving to the contained value
   * @throws Error if the Result is in a failurwe state
   */
  public get value(): Promise<T> {
    if (this.isFailure && !this._options.defaultValueWhenFailure) {
      throw new Error("Cannot get value from failed result");
    }
    return this._value as Promise<T>;
  }

  /**
   * Gets the array of errors associated with the Result.
   *
   * @returns Array of error objects
   */
  public get errors(): IError[] {
    return this._options.preserveErrorsOrder
      ? [...this._errors]
      : [...this._errors].reverse();
  }

  /**
   * Gets the array of errors associated with the Result.
   * @deprecated Use the errors property instead
   * @returns Array of error objects
   */
  public getErrors(): IError[] {
    return this.errors;
  }

  /**
   * Gets the array of success messages associated with the Result.
   *
   * @returns Array of success objects
   */
  public getSuccesses(): ISuccess[] {
    return [...this._successes];
  }

  /**
   * Gets the metadata associated with the Result.
   *
   * @returns The metadata object or undefined if none exists
   */
  public get metadata(): IResultMetadata<TContext> | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  /**
   * Gets the metadata associated with the Result.
   * @deprecated Use the metadata property instead
   * @returns The metadata object or undefined if none exists
   */
  public getMetadata(): IResultMetadata<TContext> | undefined {
    return this.metadata;
  }

  // Builder methods
  /**
   * Adds an error to the Result and sets its state to failure.
   *
   * @param error - The error message or object to add
   * @returns The Result instance for chaining
   */
  public withError(error: string | IError): this {
    this.addError(typeof error === "string" ? { message: error } : error);
    this._isSuccess = false;
    return this;
  }

  /**
   * Adds a success message to the Result.
   *
   * @param success - The success message or object to add
   * @returns The Result instance for chaining
   */
  public withSuccess(success: string | ISuccess): this {
    this.addSuccess(
      typeof success === "string"
        ? { message: success, timestamp: new Date() }
        : { ...success, timestamp: new Date() }
    );
    return this;
  }

  /**
   * Sets the value of the Result if it's in a success state.
   *
   * @param value - The value to set
   * @returns Promise of the Result instance for chaining
   */
  public async withValue(value: T | Promise<T>): Promise<this> {
    if (this.isSuccess) {
      this._value = value instanceof Promise ? value : Promise.resolve(value);
    }
    return this;
  }

  /**
   * Adds context information to the last error in the Result.
   *
   * @param context - The context object to add
   * @returns The Result instance for chaining
   */
  public withContext(context: Record<string, unknown>): this {
    if (this._errors.length > 0) {
      this._errors[this._errors.length - 1].context = {
        ...this._errors[this._errors.length - 1].context,
        ...context,
      };
    }
    return this;
  }

  /**
   * Clears all errors from the Result and sets its state to success.
   *
   * @returns The Result instance for chaining
   */
  public clearErrors(): this {
    this._errors = [];
    this._isSuccess = true;
    return this;
  }

  /**
   * Logs the current state of the Result to the console.
   *
   * @returns Promise of the Result instance for chaining
   */
  public async log(): Promise<this> {
    console.group("AsyncResult Log");
    console.log("Status:", this.isSuccess ? "success" : "failure");
    console.log("Value:", await this._value);
    console.log("Errors:", this._errors);
    console.log("Successes:", this._successes);
    console.groupEnd();
    return this;
  }

  private addError(error: IError): void {
    this._errors.push({
      ...error,
      timestamp: error.timestamp || new Date(),
    });
  }

  private addSuccess(success: ISuccess): void {
    this._successes.push({
      ...success,
      timestamp: success.timestamp || new Date(),
    });
  }

  /**
   * Adds metadata to the Result.
   *
   * @param metadata - The metadata object to add
   * @returns The Result instance for chaining
   */
  public withMetadata(metadata: IResultMetadata<TContext>): this {
    this._metadata = {
      ...this._metadata,
      ...metadata,
      timestamp: metadata.timestamp || new Date(),
    };
    return this;
  }

  /**
   * Converts the ResultAsync to a synchronous Result.
   *
   * @returns Promise of a synchronous Result instance
   */
  public async toResult(): Promise<Result<T, TContext>> {
    const value = await this._value;
    const result = this.isSuccess
      ? Result.ok<T, TContext>(value)
      : Result.fail<T, TContext>(this.getErrors());
    if (this._metadata) {
      result.withMetadata(this._metadata);
    }
    this._successes.forEach((s) => result.withSuccess(s));
    return result;
  }

  /**
   * Executes a callback function if the Result is in a success state.
   *
   * @param callback - Function to execute with the Result value
   * @returns Promise of the Result instance for chaining
   */
  public async onSuccess(
    callback: (value: T) => void | Promise<void>
  ): Promise<this> {
    if (this.isSuccess && this._value) {
      const value = await this._value;
      await callback(value as T);
    }
    return this;
  }

  /**
   * Executes a callback function if the Result is in a failure state.
   *
   * @param callback - Function to execute with the Result errors
   * @returns Promise of the Result instance for chaining
   */
  public async onFailure(
    callback: (errors: IError[]) => void | Promise<void>
  ): Promise<this> {
    if (this.isFailure) {
      await callback(this.errors);
    }
    return this;
  }

  /**
   * Maps the Result to a new Result using a transformation function.
   * The transformation function can return either a Promise or a direct value.
   *
   * @template U - The type of the new Result value
   * @param func - Transformation function to apply to the value
   * @returns Promise of a new Result with the transformed value
   */
  public async map<U>(
    func: (value: T) => Promise<U> | U
  ): Promise<ResultAsync<U, TContext>> {
    if (this.isFailure) {
      const result = await ResultAsync.failAsync<U, TContext>(this.getErrors());
      if (this._metadata) {
        result.withMetadata(this._metadata);
      }
      return result;
    }
    if (!this._value) {
      return ResultAsync.failAsync<U, TContext>("No value present");
    }
    const value = await this._value;
    const mappedValue = await func(value as T);
    const result = await ResultAsync.okAsync<U, TContext>(mappedValue);
    if (this._metadata) {
      result.withMetadata(this._metadata);
    }
    return result;
  }

  /**
   * Binds the Result to a new Result using a transformation function.
   * Similar to map, but the transformation function returns a Result itself.
   *
   * @template U - The type of the new Result value
   * @param func - Transformation function that returns a new Result
   * @returns Promise of the new Result
   */
  public async bind<U>(
    func: (
      value: T
    ) => Promise<ResultAsync<U, TContext>> | ResultAsync<U, TContext>
  ): Promise<ResultAsync<U, TContext>> {
    if (this.isFailure) {
      const result = await ResultAsync.failAsync<U, TContext>(this.getErrors());
      if (this._metadata) {
        result.withMetadata(this._metadata);
      }
      return result;
    }
    if (!this._value) {
      return ResultAsync.failAsync<U, TContext>("No value present");
    }
    const value = await this._value;
    const result = await func(value as T);
    if (this._metadata) {
      result.withMetadata(this._metadata);
    }
    return result;
  }

  /**
   * Executes a side-effect function if the Result is in a success state.
   * Similar to onSuccess, but returns the original Result value.
   *
   * @param action - Function to execute with the Result value
   * @returns Promise of the Result instance for chaining
   */
  public async tap(action: (value: T) => void | Promise<void>): Promise<this> {
    if (this.isSuccess && this._value) {
      const value = await this._value;
      await action(value as T);
    }
    return this;
  }
}
