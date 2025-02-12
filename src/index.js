"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineAsync = exports.tryAsync = exports.fromPromise = exports.fromResult = exports.mergeAsync = exports.failAsync = exports.okAsync = exports.merge = exports.fail = exports.ok = void 0;
var result_1 = require("./result");
var result_async_1 = require("./result-async");
var async_utils_1 = require("./utils/async-utils");
__exportStar(require("./result"), exports);
__exportStar(require("./result-async"), exports);
__exportStar(require("./@types/result"), exports);
__exportStar(require("./utils/result-extensions"), exports);
__exportStar(require("./utils/async-utils"), exports);
// Synchronous Result helpers
exports.ok = result_1.Result.ok;
exports.fail = result_1.Result.fail;
exports.merge = result_1.Result.merge;
// Asynchronous Result helpers
exports.okAsync = result_async_1.ResultAsync.okAsync;
exports.failAsync = result_async_1.ResultAsync.failAsync;
exports.mergeAsync = result_async_1.ResultAsync.merge;
exports.fromResult = result_async_1.ResultAsync.fromResult;
exports.fromPromise = result_async_1.ResultAsync.from;
// Utility helpers
exports.tryAsync = async_utils_1.AsyncUtils.tryAsync;
exports.combineAsync = async_utils_1.AsyncUtils.combine;
