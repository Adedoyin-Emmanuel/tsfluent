import type {
  IError,
  ISuccess,
  IResultOptions,
  IResultMetadata,
} from "./@types/result";

/**
 * A Result monad that handles both success and failure cases in a functional way.
 * This class provides a robust way to handle errors and successes without throwing exceptions.
 *
 * @template T - The type of the value contained in the Result
 * @example
 * ```typescript
 * const result = Result.ok(42)
 *   .withSuccess('Operation completed')
 *   .map(value => value * 2);
 *
 * if (result.isSuccess()) {
 *   console.log('Value:', result.getValue());
 * } else {
 *   console.error('Errors:', result.getErrors());
 * }
 * ```
 */
export class Result<T = void> {
  private _isSuccess: boolean;
  private _value?: T;
  private _errors: IError[] = [];
  private _successes: ISuccess[] = [];
  private _metadata?: IResultMetadata;
  private _options: IResultOptions = {
    defaultValueWhenFailure: false,
    preserveErrorsOrder: true,
  };

  /**
   * Protected constructor to create a new Result instance.
   * Use static factory methods `ok()` or `fail()` to create instances.
   *
   * @param value - The value to store in the Result
   * @param options - Configuration options for the Result
   */
  protected constructor(value?: T, options?: IResultOptions) {
    this._value = value;
    this._isSuccess = true;

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

  /**
   * Creates a successful Result with the given value.
   *
   * @template T - The type of the value
   * @param value - The value to store in the Result
   * @returns A new successful Result instance
   */
  static ok<T>(value?: T): Result<T>;
  /**
   * Creates a successful Result with the given value and metadata.
   *
   * @template T - The type of the value
   * @param value - The value to store in the Result
   * @param metadata - Metadata to attach to the Result
   * @returns A new successful Result instance
   */
  static ok<T>(value: T, metadata: IResultMetadata): Result<T>;
  /**
   * Creates a successful Result with the given value and options.
   *
   * @template T - The type of the value
   * @param value - The value to store in the Result
   * @param options - Configuration options for the Result
   * @returns A new successful Result instance
   */
  static ok<T>(value: T, options: IResultOptions): Result<T>;
  static ok<T>(
    value?: T,
    metadataOrOptions?: IResultMetadata | IResultOptions
  ): Result<T> {
    if (!metadataOrOptions) {
      return new Result<T>(value);
    }

    if ("metadata" in metadataOrOptions) {
      return new Result<T>(value, metadataOrOptions as IResultOptions);
    }

    return new Result<T>(value, {
      metadata: metadataOrOptions as IResultMetadata,
    });
  }

  /**
   * Creates a failed Result with the given error message.
   *
   * @template T - The type of the value
   * @param errorMessage - The error message
   * @returns A new failed Result instance
   */
  static fail<T>(errorMessage: string): Result<T>;
  /**
   * Creates a failed Result with the given error object.
   *
   * @template T - The type of the value
   * @param error - The error object
   * @returns A new failed Result instance
   */
  static fail<T>(error: IError): Result<T>;
  /**
   * Creates a failed Result with the given array of errors.
   *
   * @template T - The type of the value
   * @param errors - Array of error objects
   * @returns A new failed Result instance
   */
  static fail<T>(errors: IError[]): Result<T>;
  static fail<T>(
    error: string | IError | IError[],
    metadata?: IResultMetadata
  ): Result<T> {
    const result = new Result<T>(undefined, { metadata });
    result._isSuccess = false;

    if (Array.isArray(error)) {
      error.forEach((e) => result.addError(e));
    } else {
      result.addError(typeof error === "string" ? { message: error } : error);
    }

    return result;
  }

  /**
   * Merges multiple Result instances into a single Result containing an array of values.
   * If any Result is a failure, the merged Result will be a failure containing all errors.
   *
   * @template T - The type of the values
   * @param results - Array of Result instances to merge
   * @returns A new Result instance containing an array of values
   */
  static merge<T>(results: Result<T>[]): Result<T[]> {
    const mergedResult = new Result<T[]>();
    const values: T[] = [];
    let hasErrors = false;

    results.forEach((result) => {
      if (result.isSuccess && result._value !== undefined) {
        values.push(result._value);
      }
      if (result.isFailure) {
        hasErrors = true;
        result._errors.forEach((error) => mergedResult.addError(error));
      }
      result._successes.forEach((success) => mergedResult.addSuccess(success));
    });

    if (hasErrors) {
      mergedResult._isSuccess = false;
    } else {
      mergedResult._value = values;
    }

    return mergedResult;
  }

  /**
   * Gets the value contained in the Result.
   * Throws an error if the Result is in a failure state and defaultValueWhenFailure is false.
   *
   * @returns The contained value
   * @throws Error if the Result is in a failure state
   */
  public get value(): T {
    if (this.isFailure && !this._options.defaultValueWhenFailure) {
      throw new Error("Cannot get value from failed result");
    }
    return this._value as T;
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
  public getMetadata(): IResultMetadata | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  /**
   * Adds an error to the Result and sets its state to failure.
   *
   * @param error - The error message or object to add
   * @returns The Result instance for chaining
   */
  public withError(error: string | IError): Result<T> {
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
  public withSuccess(success: string | ISuccess): Result<T> {
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
   * @returns The Result instance for chaining
   */
  public withValue(value: T): Result<T> {
    if (this.isSuccess) {
      this._value = value;
    }
    return this;
  }

  /**
   * Adds context information to the last error in the Result.
   *
   * @param context - The context object to add
   * @returns The Result instance for chaining
   */
  public withContext(context: Record<string, unknown>): Result<T> {
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
  public clearErrors(): Result<T> {
    this._errors = [];
    this._isSuccess = true;
    return this;
  }

  /**
   * Logs the current state of the Result to the console.
   *
   * @returns The Result instance for chaining
   */
  public log(): Result<T> {
    console.group("Result Log");
    console.log("Status:", this.isSuccess ? "success" : "failure");
    console.log("Value:", this._value);
    console.log("Errors:", this._errors);
    console.log("Successes:", this._successes);
    console.groupEnd();
    return this;
  }

  /**
   * Converts the Result to a Promise.
   * If the Result is a failure, the Promise will reject with the first error.
   *
   * @returns A Promise that resolves with the value or rejects with the first error
   */
  public toPromise(): Promise<T> {
    if (this.isFailure && !this._options.defaultValueWhenFailure) {
      return Promise.reject(this._errors[0]);
    }
    return Promise.resolve(this._value as T);
  }

  /**
   * Internal method to add an error to the Result.
   *
   * @param error - The error object to add
   */
  private addError(error: IError): void {
    this._errors.push({
      ...error,
      timestamp: error.timestamp || new Date(),
    });
  }

  /**
   * Internal method to add a success message to the Result.
   *
   * @param success - The success object to add
   */
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
  public withMetadata(metadata: IResultMetadata): Result<T> {
    this._metadata = {
      ...this._metadata,
      ...metadata,
      timestamp: metadata.timestamp || new Date(),
    };
    return this;
  }

  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  public get isFailure(): boolean {
    return !this._isSuccess;
  }
}
