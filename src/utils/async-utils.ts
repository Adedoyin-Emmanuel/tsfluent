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
      if (result.isSuccess()) {
        values.push(result.getValue());
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
   * @returns A Promise of a ResultAsync containing the operation result or error
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
  static retry<T>(
    action: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<ResultAsync<T>> {
    const attempt = async (attemptsLeft: number): Promise<Result<T>> => {
      try {
        const result = await action();
        return Result.ok(result);
      } catch (error) {
        if (attemptsLeft <= 1) {
          return Result.fail({
            message: "Max retries reached",
            causedBy: error instanceof Error ? error : undefined,
            context: {
              retries,
              finalAttempt: true,
            },
          });
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        return attempt(attemptsLeft - 1);
      }
    };

    return ResultAsync.from(attempt(retries));
  }
}
