import { Result } from "./result";
import { ResultAsync } from "./result-async";
import { AsyncUtils } from "./utils/async-utils";

export * from "./result";
export * from "./result-async";
export * from "./@types/result";
export * from "./utils/result-extensions";
export * from "./utils/async-utils";

// Synchronous Result helpers
export const ok = Result.ok;
export const fail = Result.fail;
export const merge = Result.merge;

// Asynchronous Result helpers
export const okAsync = ResultAsync.okAsync;
export const failAsync = ResultAsync.failAsync;
export const mergeAsync = ResultAsync.merge;
export const fromResult = ResultAsync.fromResult;
export const fromPromise = ResultAsync.from;

// Utility helpers
export const tryAsync = AsyncUtils.try;
export const combineAsync = AsyncUtils.combine;
