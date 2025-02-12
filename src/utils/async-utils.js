"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncUtils = void 0;
var result_1 = require("../result");
var result_async_1 = require("../result-async");
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
var AsyncUtils = /** @class */ (function () {
    function AsyncUtils() {
    }
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
    AsyncUtils.try = function (action, options) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, action()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result_1.Result.ok(result, options || {})];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, result_1.Result.fail({
                                message: error_1 instanceof Error ? error_1.message : "Unknown error occurred",
                                causedBy: error_1 instanceof Error ? error_1 : undefined,
                                timestamp: new Date(),
                                context: { stack: error_1 instanceof Error ? error_1.stack : undefined },
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
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
    AsyncUtils.combine = function (asyncResults, options) {
        return __awaiter(this, void 0, void 0, function () {
            var results, errors, values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(asyncResults.map(function (ar) { return ar.toResult(); }))];
                    case 1:
                        results = _a.sent();
                        errors = [];
                        values = [];
                        results.forEach(function (result) {
                            if (result.isSuccess()) {
                                values.push(result.getValue());
                            }
                            else {
                                errors.push.apply(errors, result.getErrors());
                            }
                        });
                        if (errors.length > 0) {
                            return [2 /*return*/, result_async_1.ResultAsync.failAsync(errors)];
                        }
                        return [2 /*return*/, result_async_1.ResultAsync.okAsync(values, options || {})];
                }
            });
        });
    };
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
    AsyncUtils.retry = function (action_1) {
        return __awaiter(this, arguments, void 0, function (action, retries, delay) {
            var lastError, attempts, result, error_2;
            if (retries === void 0) { retries = 3; }
            if (delay === void 0) { delay = 1000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        attempts = 0;
                        _a.label = 1;
                    case 1:
                        if (!(attempts <= retries)) return [3 /*break*/, 8];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 7]);
                        return [4 /*yield*/, action()];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result_1.Result.ok(result)];
                    case 4:
                        error_2 = _a.sent();
                        lastError = error_2;
                        attempts++;
                        if (!(attempts <= retries)) return [3 /*break*/, 6];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 1];
                    case 8: return [2 /*return*/, result_1.Result.fail({
                            message: "Max retries reached",
                            causedBy: lastError instanceof Error ? lastError : undefined,
                            context: {
                                retries: retries,
                                attempts: attempts,
                                finalAttempt: true,
                            },
                        })];
                }
            });
        });
    };
    /**
     * Executes an async operation with a timeout.
     * Returns a failed Result if the operation exceeds the timeout.
     *
     * @template T - The type of the value returned by the operation
     * @param action - The async operation to execute
     * @param timeoutMs - Timeout in milliseconds
     * @returns A Promise of a Result containing the operation result or timeout error
     */
    AsyncUtils.timeout = function (action, timeoutMs) {
        return __awaiter(this, void 0, void 0, function () {
            var timeoutPromise, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        timeoutPromise = new Promise(function (_, reject) {
                            return setTimeout(function () { return reject(new Error("Operation timed out after ".concat(timeoutMs, "ms"))); }, timeoutMs);
                        });
                        return [4 /*yield*/, Promise.race([action(), timeoutPromise])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result_1.Result.ok(result)];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, result_1.Result.fail({
                                message: error_3 instanceof Error ? error_3.message : "Operation timed out",
                                causedBy: error_3 instanceof Error ? error_3 : undefined,
                                context: { timeoutMs: timeoutMs },
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
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
    AsyncUtils.tryAsync = function (action_1) {
        return __awaiter(this, arguments, void 0, function (action, maxAttempts, delayMs, timeoutMs) {
            var lastError, attempts, result, timeoutPromise, error_4;
            if (maxAttempts === void 0) { maxAttempts = 3; }
            if (delayMs === void 0) { delayMs = 1000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        attempts = 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 9]);
                        result = void 0;
                        if (!timeoutMs) return [3 /*break*/, 3];
                        timeoutPromise = new Promise(function (_, reject) {
                            return setTimeout(function () { return reject(new Error("Operation timed out")); }, timeoutMs);
                        });
                        return [4 /*yield*/, Promise.race([action(), timeoutPromise])];
                    case 2:
                        result = _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, action()];
                    case 4:
                        result = _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, result_1.Result.ok(result)];
                    case 6:
                        error_4 = _a.sent();
                        lastError = error_4;
                        if (error_4 instanceof Error && error_4.message === "Operation timed out") {
                            return [2 /*return*/, result_1.Result.fail({
                                    message: "Operation timed out",
                                    context: { timeoutMs: timeoutMs },
                                })];
                        }
                        if (!(attempts + 1 < maxAttempts && delayMs > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delayMs); })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [3 /*break*/, 9];
                    case 9:
                        if (++attempts < maxAttempts) return [3 /*break*/, 1];
                        _a.label = 10;
                    case 10: return [2 /*return*/, result_1.Result.fail({
                            message: lastError instanceof Error
                                ? lastError.message
                                : "Operation failed after retries",
                            causedBy: lastError instanceof Error ? lastError : undefined,
                            context: {
                                attempts: attempts,
                                maxAttempts: maxAttempts,
                                delayMs: delayMs,
                                timeoutMs: timeoutMs,
                            },
                        })];
                }
            });
        });
    };
    return AsyncUtils;
}());
exports.AsyncUtils = AsyncUtils;
