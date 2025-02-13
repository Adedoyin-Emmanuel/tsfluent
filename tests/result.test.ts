import { describe, it, expect } from "bun:test";
import {
  ok,
  fail,
  merge,
  okAsync,
  failAsync,
  mergeAsync,
  fromResult,
  fromPromise,
  tryAsync,
  combineAsync,
  Result,
} from "../src";

describe("Result", () => {
  describe("ok", () => {
    it("should create a successful result", () => {
      const result = Result.ok(42);
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.value).toBe(42);
    });

    it("should create a successful result with undefined value", () => {
      const result = ok();
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeUndefined();
    });

    it("should create a successful result with metadata", () => {
      const result = ok(42, { timestamp: new Date() });
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(42);
      expect(result.getMetadata()?.timestamp).toBeInstanceOf(Date);
    });
  });

  describe("fail", () => {
    it("should create a failed result", () => {
      const result = Result.fail("error");
      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
      expect(() => result.value).toThrow();
      expect(result.errors[0].message).toBe("error");
    });

    it("should create a failed result with an error object", () => {
      const error = { message: "Error", reasonCode: "ERR_001" };
      const result = fail(error);
      expect(result.isFailure).toBe(true);
      expect(result.errors[0]).toMatchObject(error);
    });

    it("should create a failed result with multiple errors", () => {
      const errors = [{ message: "Error 1" }, { message: "Error 2" }];
      const result = fail(errors);
      expect(result.isFailure).toBe(true);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.map((e: { message: string }) => e.message)).toEqual([
        "Error 1",
        "Error 2",
      ]);
    });
  });

  describe("instance methods", () => {
    describe("withError/withSuccess", () => {
      it("should add error and change status to failure", () => {
        const result = ok(42).withError("Something went wrong");
        expect(result.isFailure).toBe(true);
        expect(result.errors[0].message).toBe("Something went wrong");
      });

      it("should add success message without changing status", () => {
        const result = ok(42).withSuccess("Operation completed");
        expect(result.isSuccess).toBe(true);
        expect(result.getSuccesses()[0].message).toBe("Operation completed");
      });
    });

    describe("withValue", () => {
      it("should update value when result is success", () => {
        const result = ok(42).withValue(84);
        expect(result.value).toBe(84);
      });

      it("should not update value when result is failure", () => {
        const result = fail("Error").withValue(42);
        expect(result.isFailure).toBe(true);
        expect(() => result.value).toThrow();
      });
    });

    describe("withContext", () => {
      it("should add context to the last error", () => {
        const result = fail("Error").withContext({ details: "More info" });
        expect(result.errors[0].context).toEqual({ details: "More info" });
      });
    });

    describe("withMetadata", () => {
      it("should add metadata to the result", () => {
        const result = ok(42).withMetadata({ timestamp: new Date() });
        expect(result.getMetadata()?.timestamp).toBeInstanceOf(Date);
      });
    });

    describe("clearErrors", () => {
      it("should clear errors and reset status to success", () => {
        const result = fail("Error").clearErrors();
        expect(result.isSuccess).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    describe("toPromise", () => {
      it("should resolve with value for success result", async () => {
        const value = await ok(42).toPromise();
        expect(value).toBe(42);
      });

      it("should reject with error for failure result", async () => {
        await expect(fail("Error").toPromise()).rejects.toMatchObject({
          message: "Error",
        });
      });
    });
  });

  describe("merge", () => {
    it("should merge multiple successful results", () => {
      const results = [ok(1), ok(2), ok(3)];
      const merged = merge(results);
      expect(merged.isSuccess).toBe(true);
      expect(merged.value).toEqual([1, 2, 3]);
    });

    it("should merge results and collect all errors", () => {
      const results = [ok(1), fail("Error 1"), fail("Error 2")];
      const merged = merge(results);
      expect(merged.isFailure).toBe(true);
      expect(merged.errors).toHaveLength(2);
    });
  });
});

describe("ResultAsync", () => {
  describe("static factory methods", () => {
    describe("okAsync", () => {
      it("should create a successful async result with a value", async () => {
        const result = await okAsync(42);
        expect(result.isSuccess).toBe(true);
        const value = await result.value;
        expect(value).toBe(42);
      });

      it("should create a successful async result with a promise", async () => {
        const result = await okAsync(Promise.resolve(42));
        expect(result.isSuccess).toBe(true);
        const value = await result.value;
        expect(value).toBe(42);
      });
    });

    describe("failAsync", () => {
      it("should create a failed async result with an error message", async () => {
        const result = await failAsync("Something went wrong");
        expect(result.isFailure).toBe(true);
        expect(result.errors[0].message).toBe("Something went wrong");
      });

      it("should create a failed async result with multiple errors", async () => {
        const errors = [{ message: "Error 1" }, { message: "Error 2" }];
        const result = await failAsync(errors);
        expect(result.isFailure).toBe(true);
        expect(result.errors).toHaveLength(2);
      });
    });
  });

  describe("conversion methods", () => {
    describe("fromResult", () => {
      it("should convert successful Result to ResultAsync", async () => {
        const syncResult = ok(42);
        const asyncResult = fromResult(syncResult);
        expect(asyncResult.isSuccess).toBe(true);
        const value = await asyncResult.value;
        expect(value).toBe(42);
      });

      it("should convert failed Result to ResultAsync", async () => {
        const syncResult = fail("Error");
        const asyncResult = fromResult(syncResult);
        expect(asyncResult.isFailure).toBe(true);
        expect(asyncResult.errors[0].message).toBe("Error");
      });
    });

    describe("fromPromise", () => {
      it("should create ResultAsync from Promise of Result", async () => {
        const promise = Promise.resolve(ok(42));
        const result = await fromPromise(promise);
        expect(result.isSuccess).toBe(true);
        const value = await result.value;
        expect(value).toBe(42);
      });
    });
  });

  describe("mergeAsync", () => {
    it("should merge multiple successful async results", async () => {
      const results = await Promise.all([okAsync(1), okAsync(2), okAsync(3)]);
      const merged = await mergeAsync(results);
      expect(merged.isSuccess).toBe(true);
      const values = await merged.value;
      expect(values).toEqual([1, 2, 3]);
    });

    it("should merge async results and collect all errors", async () => {
      const results = await Promise.all([
        okAsync(1),
        failAsync("Error 1"),
        failAsync("Error 2"),
      ]);
      const merged = await mergeAsync(results);
      expect(merged.isFailure).toBe(true);
      expect(merged.errors).toHaveLength(2);
    });
  });
});

describe("AsyncUtils", () => {
  describe("tryAsync", () => {
    it("should wrap successful async operation", async () => {
      const result = await tryAsync(async () => 42);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(42);
    });

    it("should wrap failed async operation", async () => {
      const result = await tryAsync(async () => {
        throw new Error("Async error");
      });
      expect(result.isFailure).toBe(true);
      expect(result.errors[0].message).toBe("Async error");
    });
  });

  describe("combineAsync", () => {
    it("should combine multiple async results", async () => {
      const results = await Promise.all([okAsync(1), okAsync(2), okAsync(3)]);
      const combined = await combineAsync(results);
      expect(combined.isSuccess).toBe(true);
      const values = await combined.value;
      expect(values).toEqual([1, 2, 3]);
    });

    it("should combine and collect all errors", async () => {
      const results = await Promise.all([
        okAsync(1),
        failAsync("Error 1"),
        failAsync("Error 2"),
      ]);
      const combined = await combineAsync(results);
      expect(combined.isFailure).toBe(true);
      expect(combined.errors).toHaveLength(2);
    });
  });
});
