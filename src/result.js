"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Result = void 0;
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
var Result = /** @class */ (function () {
    /**
     * Protected constructor to create a new Result instance.
     * Use static factory methods `ok()` or `fail()` to create instances.
     *
     * @param value - The value to store in the Result
     * @param options - Configuration options for the Result
     */
    function Result(value, options) {
        this._errors = [];
        this._successes = [];
        this._status = "success";
        this._options = {
            defaultValueWhenFailure: false,
            preserveErrorsOrder: true,
        };
        this._value = value;
        if (options) {
            this._options = __assign(__assign({}, this._options), options);
            if (options.metadata) {
                this._metadata = __assign(__assign({}, options.metadata), { timestamp: options.metadata.timestamp || new Date() });
            }
        }
    }
    Result.ok = function (value, metadataOrOptions) {
        if (!metadataOrOptions) {
            return new Result(value);
        }
        if ("metadata" in metadataOrOptions) {
            return new Result(value, metadataOrOptions);
        }
        return new Result(value, {
            metadata: metadataOrOptions,
        });
    };
    Result.fail = function (error, metadata) {
        var result = new Result(undefined, { metadata: metadata });
        result._status = "failure";
        if (Array.isArray(error)) {
            error.forEach(function (e) { return result.addError(e); });
        }
        else {
            result.addError(typeof error === "string" ? { message: error } : error);
        }
        return result;
    };
    /**
     * Merges multiple Result instances into a single Result containing an array of values.
     * If any Result is a failure, the merged Result will be a failure containing all errors.
     *
     * @template T - The type of the values
     * @param results - Array of Result instances to merge
     * @returns A new Result instance containing an array of values
     */
    Result.merge = function (results) {
        var mergedResult = new Result();
        var values = [];
        var hasErrors = false;
        results.forEach(function (result) {
            if (result.isSuccess() && result._value !== undefined) {
                values.push(result._value);
            }
            if (result.isFailure()) {
                hasErrors = true;
                result._errors.forEach(function (error) { return mergedResult.addError(error); });
            }
            result._successes.forEach(function (success) { return mergedResult.addSuccess(success); });
        });
        if (hasErrors) {
            mergedResult._status = "failure";
        }
        else {
            mergedResult._value = values;
        }
        return mergedResult;
    };
    /**
     * Checks if the Result is in a success state.
     *
     * @returns True if the Result is successful, false otherwise
     */
    Result.prototype.isSuccess = function () {
        return this._status === "success";
    };
    /**
     * Checks if the Result is in a failure state.
     *
     * @returns True if the Result is a failure, false otherwise
     */
    Result.prototype.isFailure = function () {
        return !this.isSuccess();
    };
    /**
     * Gets the value contained in the Result.
     * Throws an error if the Result is in a failure state and defaultValueWhenFailure is false.
     *
     * @returns The contained value
     * @throws Error if the Result is in a failure state
     */
    Result.prototype.getValue = function () {
        if (this.isFailure() && !this._options.defaultValueWhenFailure) {
            throw new Error("Cannot get value from failed result");
        }
        return this._value;
    };
    /**
     * Gets the array of errors associated with the Result.
     *
     * @returns Array of error objects
     */
    Result.prototype.getErrors = function () {
        return this._options.preserveErrorsOrder
            ? __spreadArray([], this._errors, true) : __spreadArray([], this._errors, true).reverse();
    };
    /**
     * Gets the array of success messages associated with the Result.
     *
     * @returns Array of success objects
     */
    Result.prototype.getSuccesses = function () {
        return __spreadArray([], this._successes, true);
    };
    /**
     * Gets the metadata associated with the Result.
     *
     * @returns The metadata object or undefined if none exists
     */
    Result.prototype.getMetadata = function () {
        return this._metadata ? __assign({}, this._metadata) : undefined;
    };
    /**
     * Adds an error to the Result and sets its state to failure.
     *
     * @param error - The error message or object to add
     * @returns The Result instance for chaining
     */
    Result.prototype.withError = function (error) {
        this.addError(typeof error === "string" ? { message: error } : error);
        this._status = "failure";
        return this;
    };
    /**
     * Adds a success message to the Result.
     *
     * @param success - The success message or object to add
     * @returns The Result instance for chaining
     */
    Result.prototype.withSuccess = function (success) {
        this.addSuccess(typeof success === "string"
            ? { message: success, timestamp: new Date() }
            : __assign(__assign({}, success), { timestamp: new Date() }));
        return this;
    };
    /**
     * Sets the value of the Result if it's in a success state.
     *
     * @param value - The value to set
     * @returns The Result instance for chaining
     */
    Result.prototype.withValue = function (value) {
        if (this.isSuccess()) {
            this._value = value;
        }
        return this;
    };
    /**
     * Adds context information to the last error in the Result.
     *
     * @param context - The context object to add
     * @returns The Result instance for chaining
     */
    Result.prototype.withContext = function (context) {
        if (this._errors.length > 0) {
            this._errors[this._errors.length - 1].context = __assign(__assign({}, this._errors[this._errors.length - 1].context), context);
        }
        return this;
    };
    /**
     * Clears all errors from the Result and sets its state to success.
     *
     * @returns The Result instance for chaining
     */
    Result.prototype.clearErrors = function () {
        this._errors = [];
        this._status = "success";
        return this;
    };
    /**
     * Logs the current state of the Result to the console.
     *
     * @returns The Result instance for chaining
     */
    Result.prototype.log = function () {
        console.group("Result Log");
        console.log("Status:", this._status);
        console.log("Value:", this._value);
        console.log("Errors:", this._errors);
        console.log("Successes:", this._successes);
        console.groupEnd();
        return this;
    };
    /**
     * Converts the Result to a Promise.
     * If the Result is a failure, the Promise will reject with the first error.
     *
     * @returns A Promise that resolves with the value or rejects with the first error
     */
    Result.prototype.toPromise = function () {
        if (this.isFailure() && !this._options.defaultValueWhenFailure) {
            return Promise.reject(this._errors[0]);
        }
        return Promise.resolve(this._value);
    };
    /**
     * Internal method to add an error to the Result.
     *
     * @param error - The error object to add
     */
    Result.prototype.addError = function (error) {
        this._errors.push(__assign(__assign({}, error), { timestamp: error.timestamp || new Date() }));
    };
    /**
     * Internal method to add a success message to the Result.
     *
     * @param success - The success object to add
     */
    Result.prototype.addSuccess = function (success) {
        this._successes.push(__assign(__assign({}, success), { timestamp: success.timestamp || new Date() }));
    };
    /**
     * Adds metadata to the Result.
     *
     * @param metadata - The metadata object to add
     * @returns The Result instance for chaining
     */
    Result.prototype.withMetadata = function (metadata) {
        this._metadata = __assign(__assign(__assign({}, this._metadata), metadata), { timestamp: metadata.timestamp || new Date() });
        return this;
    };
    return Result;
}());
exports.Result = Result;
