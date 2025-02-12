"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultExtensions = void 0;
var result_1 = require("../result");
/**
 * Provides extension methods for working with Result objects in a functional programming style.
 * These methods enable chaining transformations and side effects while maintaining the Result context.
 *
 * @example
 * ```typescript
 * const result = Result.ok(5)
 *   .map(x => x * 2)
 *   .bind(x => validateNumber(x))
 *   .tap(x => console.log('Value:', x));
 * ```
 */
var ResultExtensions = /** @class */ (function () {
    function ResultExtensions() {
    }
    /**
     * Transforms a Result by applying a function that returns another Result.
     * If the input Result is a failure, returns the failure without applying the function.
     * Similar to flatMap in other functional programming contexts.
     *
     * @template T - The type of the input Result value
     * @template U - The type of the output Result value
     * @param result - The Result to transform
     * @param func - The transformation function that returns a new Result
     * @returns A new Result of type U
     *
     * @example
     * ```typescript
     * const validateAge = (age: number): Result<number> =>
     *   age >= 0 ? Result.ok(age) : Result.fail("Age must be positive");
     *
     * const result = Result.ok(25)
     *   .bind(age => validateAge(age));
     * ```
     */
    ResultExtensions.bind = function (result, func) {
        if (result.isFailure()) {
            return result_1.Result.fail(result.getErrors()[0]);
        }
        return func(result.getValue());
    };
    /**
     * Transforms a Result's value using a mapping function.
     * If the input Result is a failure, returns the failure without applying the function.
     *
     * @template T - The type of the input Result value
     * @template U - The type of the output Result value
     * @param result - The Result to transform
     * @param func - The transformation function
     * @returns A new Result containing the transformed value
     *
     * @example
     * ```typescript
     * const result = Result.ok(5)
     *   .map(x => x * 2)  // Result<number> with value 10
     *   .map(x => x.toString()); // Result<string> with value "10"
     * ```
     */
    ResultExtensions.map = function (result, func) {
        if (result.isFailure()) {
            return result_1.Result.fail(result.getErrors()[0]);
        }
        return result_1.Result.ok(func(result.getValue()));
    };
    /**
     * Executes a side-effect function with the Result's value if it's successful.
     * Always returns the original Result unchanged.
     *
     * @template T - The type of the Result value
     * @param result - The Result to tap into
     * @param action - The side-effect function to execute
     * @returns The original Result unchanged
     *
     * @example
     * ```typescript
     * const result = Result.ok("Hello")
     *   .tap(message => console.log(message))  // Logs "Hello"
     *   .map(message => message.length);       // Transforms to Result<number>
     * ```
     */
    ResultExtensions.tap = function (result, action) {
        if (result.isSuccess()) {
            action(result.getValue());
        }
        return result;
    };
    return ResultExtensions;
}());
exports.ResultExtensions = ResultExtensions;
