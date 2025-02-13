import { describe, it, expect } from "bun:test";
import {
  ResultAsync,
  okAsync,
  failAsync,
  fromPromise,
  tryAsync,
  ok,
} from "../src";

describe("ResultAsync", () => {
  describe("static factory methods", () => {
    describe("okAsync", () => {
      it("should create a successful result with a value", async () => {
        const result = await okAsync(42);
        expect(result.isSuccess).toBe(true);
        expect(await result.value).toBe(42);
      });

      it("should create a successful result with a promise", async () => {
        const result = await okAsync(Promise.resolve(42));
        expect(result.isSuccess).toBe(true);
        expect(await result.value).toBe(42);
      });

      it("should create a successful result with metadata", async () => {
        const result = await okAsync(42, { message: "Success" });
        expect(result.isSuccess).toBe(true);
        expect(await result.value).toBe(42);
        expect(result.getMetadata()?.message).toBe("Success");
      });
    });

    describe("errAsync", () => {
      it("should create a failed result with an error message", async () => {
        const result = await failAsync("Something went wrong");
        expect(result.isFailure).toBe(true);
        expect(result.errors[0].message).toBe("Something went wrong");
      });

      it("should create a failed result with an error object", async () => {
        const error = { message: "Error", reasonCode: "ERR_001" };
        const result = await failAsync(error);
        expect(result.isFailure).toBe(true);
        const receivedError = result.errors[0];
        expect(receivedError.message).toBe(error.message);
        expect(receivedError.reasonCode).toBe(error.reasonCode);
        expect(receivedError.timestamp).toBeDefined();
      });

      it("should create a failed result with multiple errors", async () => {
        const errors = [{ message: "Error 1" }, { message: "Error 2" }];
        const result = await failAsync(errors);
        expect(result.isFailure).toBe(true);
        const receivedErrors = result.errors;
        expect(receivedErrors.length).toBe(2);
        expect(receivedErrors[0].message).toBe(errors[0].message);
        expect(receivedErrors[1].message).toBe(errors[1].message);
        expect(receivedErrors[0].timestamp).toBeDefined();
        expect(receivedErrors[1].timestamp).toBeDefined();
      });
    });

    describe("fromAsyncThrowable", () => {
      it("should return success result when async function succeeds", async () => {
        const result = await tryAsync(async () => {
          return Promise.resolve(42);
        });
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe(42);
      });
    });

    describe("fromPromise", () => {
      it("should handle resolved promise", async () => {
        const result = await fromPromise(Promise.resolve(ok(42)));
        expect(result.isSuccess).toBe(true);
        expect(await result.value).toBe(42);
      });

      it("should handle rejected promise", async () => {
        const result = await fromPromise(
          Promise.reject(new Error("Promise error"))
        );
        expect(result.isFailure).toBe(true);
        expect(result.errors[0].message).toBe("Promise error");
      });
    });
  });

  describe("instance methods", () => {
    describe("withError/withSuccess", () => {
      it("should add error and change status to failure", async () => {
        const result = (await okAsync(42)).withError("Something went wrong");
        expect(result.isFailure).toBe(true);
        expect(result.errors[0].message).toBe("Something went wrong");
      });

      it("should add success message without changing status", async () => {
        const result = (await okAsync(42)).withSuccess("Operation completed");
        expect(result.isSuccess).toBe(true);
        expect(await result.value).toBe(42);
        expect(result.getSuccesses()[0].message).toBe("Operation completed");
      });
    });

    describe("withValue", () => {
      it("should update value when result is success", async () => {
        const result = await (await okAsync(42)).withValue(84);
        expect(await result.value).toBe(84);
      });

      it("should not update value when result is failure", async () => {
        const result = await (await failAsync("Error")).withValue(42);
        expect(result.isFailure).toBe(true);
        expect(result.errors[0].message).toBe("Error");
      });
    });

    describe("map/bind/tap", () => {
      it("should map successful result", async () => {
        const result = await okAsync(42);
        const mapped = await result.map((x) => x * 2);
        expect(await mapped.value).toBe(84);
      });

      it("should bind successful result", async () => {
        const result = await okAsync(42);
        const bound = await result.bind((x) => okAsync(x * 2));
        expect(await bound.value).toBe(84);
      });

      it("should execute tap without changing value", async () => {
        let sideEffect = 0;
        const result = await okAsync(42);
        await result.tap((x) => {
          sideEffect = x;
        });
        expect(sideEffect).toBe(42);
        expect(await result.value).toBe(42);
      });
    });

    describe("onSuccess/onFailure", () => {
      it("should execute onSuccess callback for success", async () => {
        let called = false;
        const result = await okAsync(42);
        await result.onSuccess(() => {
          called = true;
        });
        expect(called).toBe(true);
      });

      it("should execute onFailure callback for failure", async () => {
        let called = false;
        const result = await failAsync("Error");
        await result.onFailure(() => {
          called = true;
        });
        expect(called).toBe(true);
      });
    });
  });

  describe("merge", () => {
    it("should merge multiple successful results", async () => {
      const results = [await okAsync(1), await okAsync(2), await okAsync(3)];
      const merged = await ResultAsync.merge(results);
      expect(merged.isSuccess).toBe(true);
      expect(await merged.value).toEqual([1, 2, 3]);
    });

    it("should merge results and collect all errors", async () => {
      const results = [
        await okAsync(1),
        await failAsync("Error 1"),
        await failAsync("Error 2"),
      ];
      const merged = await ResultAsync.merge(results);
      expect(merged.isFailure).toBe(true);
      expect(merged.errors.length).toBe(2);
    });
  });
});
