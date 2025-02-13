import { Result } from "../result";
import { ResultAsync } from "../result-async";
import type { IError, IResultOptions } from "../@types/result";

/**
 * Utility class providing helper methods for working with asynchronous operations
 * in a Result-based error handling context.
 *
 * @example
 * ```typescript
 * // Wrap an async operation
 * const result = await AsyncUtils.try(async () => {
 *   const data = await fetchData();
 *   return processData(data);
 * });
 *
 * // Retry a failing operation
 * const result = await AsyncUtils.retry(
 *   async () => await unreliableOperation(),
 *   3,  // retries
 *   1000 // delay in ms
 * );
 * ```
 */
export class AsyncUtils {
  /**
   * Wraps an asynchronous operation in a Result type.
   * Catches any errors and returns them as a failed Result.
   *
   * @template T - The type of the value returned by the operation
   * @param action - The async operation to execute
   * @param options - Configuration options for the Result
   * @returns A Promise of a Result containing either the operation's value or error
   *
   * @example
   * ```typescript
   * const result = await AsyncUtils.try(async () => {
   *   const response = await fetch('https://api.example.com/data');
   *   return response.json();
   * });
   * ```
   */
  static async try<T>(
    action: () => Promise<T>,
    options?: IResultOptions
  ): Promise<Result<T>> {
    try {
      const result = await action();
      return Result.ok<T>(result, options || {});
    } catch (error) {
      return Result.fail({
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        causedBy: error instanceof Error ? error : undefined,
        timestamp: new Date(),
        context: { stack: error instanceof Error ? error.stack : undefined },
      });
    }
  }

  /**
   * Combines multiple ResultAsync instances into a single ResultAsync containing an array of values.
   * If any Result is a failure, the combined Result will contain all errors.
   *
   * @template T - The type of values in the Results
   * @param asyncResults - Array of ResultAsync instances to combine
   * @param options - Configuration options for the combined Result
   * @returns A Promise of a ResultAsync containing an array of values or all errors
   *
   * @example
   * ```typescript
   * const results = await AsyncUtils.combine([
   *   ResultAsync.ok(fetchUser(1)),
   *   ResultAsync.ok(fetchUser(2)),
   *   ResultAsync.ok(fetchUser(3))
   * ]);
   * ```
   */
  static async combine<T>(
    asyncResults: ResultAsync<T>[],
    options?: IResultOptions
  ): Promise<ResultAsync<T[]>> {
    const results = await Promise.all(asyncResults.map((ar) => ar.toResult()));
    const errors: IError[] = [];
    const values: T[] = [];

    results.forEach((result: Result<T>) => {
      if (result.isSuccess) {
        values.push(result.value);
      } else {
        errors.push(...result.getErrors());
      }
    });

    if (errors.length > 0) {
      return ResultAsync.failAsync(errors);
    }

    return ResultAsync.okAsync(values, options || {});
  }

  /**
   * Retries a failing async operation multiple times with a delay between attempts.
   * Returns a failed Result if all retries are exhausted.
   *
   * @template T - The type of the value returned by the operation
   * @param action - The async operation to retry
   * @param retries - Number of retry attempts (default: 3)
   * @param delay - Delay in milliseconds between retries (default: 1000)
   * @returns A Promise of a Result containing the operation result or error
   *
   * @example
   * ```typescript
   * const result = await AsyncUtils.retry(
   *   async () => await unreliableApiCall(),
   *   5,    // 5 retries
   *   2000  // 2 seconds between retries
   * );
   * ```
   */
  static async retry<T>(
    action: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<Result<T>> {
    let lastError: any;
    let attempts = 0;

    while (attempts <= retries) {
      try {
        const result = await action();
        return Result.ok(result);
      } catch (error) {
        lastError = error;
        attempts++;

        if (attempts <= retries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    return Result.fail({
      message: "Max retries reached",
      causedBy: lastError instanceof Error ? lastError : undefined,
      context: {
        retries,
        attempts,
        finalAttempt: true,
      },
    });
  }

  /**
   * Executes an async operation with a timeout.
   * Returns a failed Result if the operation exceeds the timeout.
   *
   * @template T - The type of the value returned by the operation
   * @param action - The async operation to execute
   * @param timeoutMs - Timeout in milliseconds
   * @returns A Promise of a Result containing the operation result or timeout error
   */
  static async timeout<T>(
    action: () => Promise<T>,
    timeoutMs: number
  ): Promise<Result<T>> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
          timeoutMs
        )
      );

      const result = await Promise.race([action(), timeoutPromise]);
      return Result.ok(result);
    } catch (error) {
      return Result.fail({
        message: error instanceof Error ? error.message : "Operation timed out",
        causedBy: error instanceof Error ? error : undefined,
        context: { timeoutMs },
      });
    }
  }

  /**
   * Attempts to execute an async operation with retries.
   * Returns a Result containing either the successful value or error details.
   *
   * @template T - The type of the value returned by the operation
   * @param action - The async operation to execute
   * @param maxAttempts - Maximum number of attempts (default: 3)
   * @param delayMs - Delay between retries in milliseconds (default: 1000)
   * @param timeoutMs - Timeout in milliseconds (optional)
   * @returns A Promise of a Result containing either the operation's value or error
   */
  static async tryAsync<T>(
    action: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000,
    timeoutMs?: number
  ): Promise<Result<T>> {
    let lastError: any;
    let attempts = 0;

    do {
      try {
        let result;
        if (timeoutMs) {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Operation timed out")),
              timeoutMs
            )
          );
          result = await Promise.race([action(), timeoutPromise]);
        } else {
          result = await action();
        }
        return Result.ok(result);
      } catch (error) {
        lastError = error;

        if (error instanceof Error && error.message === "Operation timed out") {
          return Result.fail({
            message: "Operation timed out",
            context: { timeoutMs },
          });
        }

        if (attempts + 1 < maxAttempts && delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    } while (++attempts < maxAttempts);

    return Result.fail({
      message:
        lastError instanceof Error
          ? lastError.message
          : "Operation failed after retries",
      causedBy: lastError instanceof Error ? lastError : undefined,
      context: {
        attempts,
        maxAttempts,
        delayMs,
        timeoutMs,
      },
    });
  }
}
