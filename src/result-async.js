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
exports.ResultAsync = void 0;
var result_1 = require("./result");
/**
 * Represents an asynchronous Result monad that handles both success and failure cases.
 * This class is designed to work with Promises and async operations while maintaining
 * the same functional programming principles as the synchronous Result class.
 *
 * @template T - The type of the value contained in the Result
 * @example
 * ```typescript
 * const result = await ResultAsync.ok(fetchUserData());
 * const processedResult = await result
 *   .map(user => processUser(user))
 *   .onSuccess(user => console.log('User processed:', user))
 *   .onFailure(errors => console.error('Failed:', errors));
 * ```
 */
var ResultAsync = /** @class */ (function () {
    /**
     * Protected constructor to create a new ResultAsync instance.
     * Use static factory methods `ok()` or `fail()` to create instances.
     *
     * @param value - The value to store in the Result
     * @param options - Configuration options for the Result
     */
    function ResultAsync(value, options) {
        this._errors = [];
        this._successes = [];
        this._status = "success";
        this._options = {
            defaultValueWhenFailure: false,
            preserveErrorsOrder: true,
        };
        if (value instanceof Promise) {
            this._value = value;
        }
        else {
            this._value = Promise.resolve(value);
        }
        if (options) {
            this._options = __assign(__assign({}, this._options), options);
            if (options.metadata) {
                this._metadata = __assign(__assign({}, options.metadata), { timestamp: options.metadata.timestamp || new Date() });
            }
        }
    }
    ResultAsync.okAsync = function (value, metadataOrOptions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!metadataOrOptions) {
                    return [2 /*return*/, new ResultAsync(value)];
                }
                if ("metadata" in metadataOrOptions) {
                    return [2 /*return*/, new ResultAsync(value, metadataOrOptions)];
                }
                return [2 /*return*/, new ResultAsync(value, {
                        metadata: metadataOrOptions,
                    })];
            });
        });
    };
    ResultAsync.failAsync = function (error, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                result = new ResultAsync(undefined, { metadata: metadata });
                result._status = "failure";
                if (Array.isArray(error)) {
                    error.forEach(function (e) { return result.addError(e); });
                }
                else {
                    result.addError(typeof error === "string" ? { message: error } : error);
                }
                return [2 /*return*/, result];
            });
        });
    };
    /**
     * Merges multiple ResultAsync instances into a single ResultAsync containing an array of values.
     * If any Result is a failure, the merged Result will be a failure containing all errors.
     *
     * @template T - The type of the values
     * @param results - Array of ResultAsync instances to merge
     * @returns A Promise of a new ResultAsync instance containing an array of values
     */
    ResultAsync.merge = function (results) {
        return __awaiter(this, void 0, void 0, function () {
            var mergedResult, valuePromises, hasErrors, _i, results_1, result;
            return __generator(this, function (_a) {
                mergedResult = new ResultAsync();
                valuePromises = [];
                hasErrors = false;
                for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                    result = results_1[_i];
                    if (result.isSuccess() && result._value !== undefined) {
                        valuePromises.push(result._value);
                    }
                    if (result.isFailure()) {
                        hasErrors = true;
                        result._errors.forEach(function (error) { return mergedResult.addError(error); });
                    }
                    result._successes.forEach(function (success) { return mergedResult.addSuccess(success); });
                }
                if (hasErrors) {
                    mergedResult._status = "failure";
                    mergedResult._value = Promise.resolve([]);
                }
                else {
                    mergedResult._value = Promise.all(valuePromises);
                }
                return [2 /*return*/, mergedResult];
            });
        });
    };
    /**
     * Creates a ResultAsync from a synchronous Result instance.
     *
     * @template T - The type of the value
     * @param result - The synchronous Result to convert
     * @returns A new ResultAsync instance
     */
    ResultAsync.fromResult = function (result) {
        var asyncResult = new ResultAsync(result.isSuccess() ? result.getValue() : undefined);
        if (result.isFailure()) {
            asyncResult._status = "failure";
            result.getErrors().forEach(function (error) { return asyncResult.addError(error); });
        }
        result.getSuccesses().forEach(function (success) { return asyncResult.addSuccess(success); });
        var metadata = result.getMetadata();
        if (metadata) {
            asyncResult.withMetadata(metadata);
        }
        return asyncResult;
    };
    /**
     * Creates a ResultAsync from a Promise that resolves to a Result or any value.
     * If the promise rejects, it will be captured as a failure.
     *
     * @template T - The type of the value
     * @param promise - Promise that resolves to a Result or value
     * @returns A Promise of a new ResultAsync instance
     */
    ResultAsync.from = function (promise) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, promise];
                    case 1:
                        result = _a.sent();
                        if (result instanceof result_1.Result) {
                            return [2 /*return*/, ResultAsync.fromResult(result)];
                        }
                        return [2 /*return*/, ResultAsync.okAsync(result)];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, ResultAsync.failAsync({
                                message: error_1 instanceof Error ? error_1.message : "Promise rejected",
                                causedBy: error_1 instanceof Error ? error_1 : undefined,
                                timestamp: new Date(),
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Checks if the Result is in a success state.
     *
     * @returns True if the Result is successful, false otherwise
     */
    ResultAsync.prototype.isSuccess = function () {
        return this._status === "success";
    };
    /**
     * Checks if the Result is in a failure state.
     *
     * @returns True if the Result is a failure, false otherwise
     */
    ResultAsync.prototype.isFailure = function () {
        return !this.isSuccess();
    };
    /**
     * Gets the value contained in the Result.
     * Throws an error if the Result is in a failure state and defaultValueWhenFailure is false.
     *
     * @returns Promise resolving to the contained value
     * @throws Error if the Result is in a failurwe state
     */
    ResultAsync.prototype.getValue = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.isFailure() && !this._options.defaultValueWhenFailure) {
                    throw new Error("Cannot get value from failed result");
                }
                return [2 /*return*/, this._value];
            });
        });
    };
    /**
     * Gets the array of errors associated with the Result.
     *
     * @returns Array of error objects
     */
    ResultAsync.prototype.getErrors = function () {
        return this._options.preserveErrorsOrder
            ? __spreadArray([], this._errors, true) : __spreadArray([], this._errors, true).reverse();
    };
    /**
     * Gets the array of success messages associated with the Result.
     *
     * @returns Array of success objects
     */
    ResultAsync.prototype.getSuccesses = function () {
        return __spreadArray([], this._successes, true);
    };
    /**
     * Gets the metadata associated with the Result.
     *
     * @returns The metadata object or undefined if none exists
     */
    ResultAsync.prototype.getMetadata = function () {
        return this._metadata ? __assign({}, this._metadata) : undefined;
    };
    // Builder methods
    /**
     * Adds an error to the Result and sets its state to failure.
     *
     * @param error - The error message or object to add
     * @returns The Result instance for chaining
     */
    ResultAsync.prototype.withError = function (error) {
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
    ResultAsync.prototype.withSuccess = function (success) {
        this.addSuccess(typeof success === "string"
            ? { message: success, timestamp: new Date() }
            : __assign(__assign({}, success), { timestamp: new Date() }));
        return this;
    };
    /**
     * Sets the value of the Result if it's in a success state.
     *
     * @param value - The value to set
     * @returns Promise of the Result instance for chaining
     */
    ResultAsync.prototype.withValue = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.isSuccess()) {
                    this._value = value instanceof Promise ? value : Promise.resolve(value);
                }
                return [2 /*return*/, this];
            });
        });
    };
    /**
     * Adds context information to the last error in the Result.
     *
     * @param context - The context object to add
     * @returns The Result instance for chaining
     */
    ResultAsync.prototype.withContext = function (context) {
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
    ResultAsync.prototype.clearErrors = function () {
        this._errors = [];
        this._status = "success";
        return this;
    };
    /**
     * Logs the current state of the Result to the console.
     *
     * @returns Promise of the Result instance for chaining
     */
    ResultAsync.prototype.log = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        console.group("AsyncResult Log");
                        console.log("Status:", this._status);
                        _b = (_a = console).log;
                        _c = ["Value:"];
                        return [4 /*yield*/, this._value];
                    case 1:
                        _b.apply(_a, _c.concat([_d.sent()]));
                        console.log("Errors:", this._errors);
                        console.log("Successes:", this._successes);
                        console.groupEnd();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    ResultAsync.prototype.addError = function (error) {
        this._errors.push(__assign(__assign({}, error), { timestamp: error.timestamp || new Date() }));
    };
    ResultAsync.prototype.addSuccess = function (success) {
        this._successes.push(__assign(__assign({}, success), { timestamp: success.timestamp || new Date() }));
    };
    /**
     * Adds metadata to the Result.
     *
     * @param metadata - The metadata object to add
     * @returns The Result instance for chaining
     */
    ResultAsync.prototype.withMetadata = function (metadata) {
        this._metadata = __assign(__assign(__assign({}, this._metadata), metadata), { timestamp: metadata.timestamp || new Date() });
        return this;
    };
    /**
     * Converts the ResultAsync to a synchronous Result.
     *
     * @returns Promise of a synchronous Result instance
     */
    ResultAsync.prototype.toResult = function () {
        return __awaiter(this, void 0, void 0, function () {
            var value, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._value];
                    case 1:
                        value = _a.sent();
                        result = this.isSuccess()
                            ? result_1.Result.ok(value)
                            : result_1.Result.fail(this.getErrors());
                        if (this._metadata) {
                            result.withMetadata(this._metadata);
                        }
                        this._successes.forEach(function (s) { return result.withSuccess(s); });
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Executes a callback function if the Result is in a success state.
     *
     * @param callback - Function to execute with the Result value
     * @returns Promise of the Result instance for chaining
     */
    ResultAsync.prototype.onSuccess = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.isSuccess() && this._value)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._value];
                    case 1:
                        value = _a.sent();
                        return [4 /*yield*/, callback(value)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * Executes a callback function if the Result is in a failure state.
     *
     * @param callback - Function to execute with the Result errors
     * @returns Promise of the Result instance for chaining
     */
    ResultAsync.prototype.onFailure = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isFailure()) return [3 /*break*/, 2];
                        return [4 /*yield*/, callback(this.getErrors())];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * Maps the Result to a new Result using a transformation function.
     * The transformation function can return either a Promise or a direct value.
     *
     * @template U - The type of the new Result value
     * @param func - Transformation function to apply to the value
     * @returns Promise of a new Result with the transformed value
     */
    ResultAsync.prototype.map = function (func) {
        return __awaiter(this, void 0, void 0, function () {
            var value, mappedValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isFailure()) {
                            return [2 /*return*/, ResultAsync.failAsync(this.getErrors())];
                        }
                        if (!this._value) {
                            return [2 /*return*/, ResultAsync.failAsync("No value present")];
                        }
                        return [4 /*yield*/, this._value];
                    case 1:
                        value = _a.sent();
                        return [4 /*yield*/, func(value)];
                    case 2:
                        mappedValue = _a.sent();
                        return [2 /*return*/, ResultAsync.okAsync(mappedValue)];
                }
            });
        });
    };
    /**
     * Binds the Result to a new Result using a transformation function.
     * Similar to map, but the transformation function returns a Result itself.
     *
     * @template U - The type of the new Result value
     * @param func - Transformation function that returns a new Result
     * @returns Promise of the new Result
     */
    ResultAsync.prototype.bind = function (func) {
        return __awaiter(this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isFailure()) {
                            return [2 /*return*/, ResultAsync.failAsync(this.getErrors())];
                        }
                        if (!this._value) {
                            return [2 /*return*/, ResultAsync.failAsync("No value present")];
                        }
                        return [4 /*yield*/, this._value];
                    case 1:
                        value = _a.sent();
                        return [2 /*return*/, func(value)];
                }
            });
        });
    };
    /**
     * Executes a side-effect function if the Result is in a success state.
     * Similar to onSuccess, but returns the original Result value.
     *
     * @param action - Function to execute with the Result value
     * @returns Promise of the Result instance for chaining
     */
    ResultAsync.prototype.tap = function (action) {
        return __awaiter(this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.isSuccess() && this._value)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._value];
                    case 1:
                        value = _a.sent();
                        return [4 /*yield*/, action(value)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, this];
                }
            });
        });
    };
    return ResultAsync;
}());
exports.ResultAsync = ResultAsync;
