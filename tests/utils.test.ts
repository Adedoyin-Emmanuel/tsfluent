import { describe, it, expect } from "bun:test";
import {
  ok,
  fail,
  okAsync,
  failAsync,
  tryAsync,
  combineAsync,
  fromResult,
} from "../src";

describe("Utils", () => {
  describe("AsyncUtils", () => {
    describe("delay", () => {
      it("should delay execution by specified milliseconds", async () => {
        const start = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 100));
        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(100);
      });
    });

    describe("tryAsync", () => {
      it("should retry failed operation specified number of times", async () => {
        let attempts = 0;
        const operation = async () => {
          attempts++;
          if (attempts < 3) throw new Error("Temporary failure");
          return "success";
        };

        const result = await tryAsync(operation);
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe("success");
        expect(attempts).toBe(3);
      });

      it("should fail after max attempts", async () => {
        let attempts = 0;
        const operation = async () => {
          attempts++;
          throw new Error("Persistent failure");
        };

        const result = await tryAsync(operation, 1);
        expect(result.isFailure).toBe(true);
        expect(result.getErrors()[0].message).toBe("Persistent failure");
        expect(attempts).toBe(1);
      });
    });

    describe("timeout", () => {
      it("should resolve if operation completes within timeout", async () => {
        const operation = async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return "success";
        };

        const result = await tryAsync(operation);
        expect(result.isSuccess).toBe(true);
        expect(result.value).toBe("success");
      });

      it("should reject if operation exceeds timeout", async () => {
        const operation = async () => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return "success";
        };

        const result = await tryAsync(operation, 1, 0, 100);
        expect(result.isFailure).toBe(true);
        expect(result.getErrors()[0].message).toBe("Operation timed out");
      });
    });
  });

  describe("ResultAsync operations", () => {
    describe("map", () => {
      it("should transform successful result value", async () => {
        const asyncResult = await fromResult<number>(ok(2));
        const mapped1 = await asyncResult.map((x: number) => x * 2);
        const mapped2 = await mapped1.map((x: number) => x + 1);

        expect(mapped2.isSuccess).toBe(true);
        expect(await mapped2.value).toBe(5);
      });

      it("should not transform failed result", async () => {
        const asyncResult = await fromResult<number>(fail("Error"));
        const mapped = await asyncResult.map((x: number) => x * 2);

        expect(mapped.isFailure).toBe(true);
      });
    });

    describe("tap", () => {
      it("should execute side effect without changing value", async () => {
        let sideEffect = 0;
        const asyncResult = await fromResult<number>(ok(2));
        const tapped = await asyncResult.tap((x: number) => {
          sideEffect = x;
        });
        const mapped = await tapped.map((x: number) => x * 2);

        expect(mapped.isSuccess).toBe(true);
        expect(await mapped.value).toBe(4);
        expect(sideEffect).toBe(2);
      });

      it("should not execute side effect on failure", async () => {
        let sideEffect = false;
        const asyncResult = await fromResult<unknown>(fail("Error"));
        const tapped = await asyncResult.tap(() => {
          sideEffect = true;
        });

        expect(tapped.isFailure).toBe(true);
        expect(sideEffect).toBe(false);
      });
    });

    describe("combine", () => {
      it("should combine multiple successful results", async () => {
        const results = [await okAsync(2), await okAsync(3), await okAsync(4)];

        const combined = await combineAsync(results);
        expect(combined.isSuccess).toBe(true);
        expect(await combined.value).toEqual([2, 3, 4]);
      });

      it("should collect all errors when combining results", async () => {
        const results = [
          await okAsync(2),
          await failAsync("Error 1"),
          await failAsync("Error 2"),
        ];

        const combined = await combineAsync(results);
        expect(combined.isFailure).toBe(true);
        expect(combined.getErrors()).toHaveLength(2);
      });
    });
  });
});
