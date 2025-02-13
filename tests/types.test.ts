import { describe, it, expect } from "bun:test";
import { ok, fail, okAsync, failAsync } from "../src";
import type { IError, ISuccess, IMetadata } from "../src";

describe("Types", () => {
  describe("IError", () => {
    it("should create error with message", () => {
      const error: IError = { message: "Something went wrong" };
      const result = fail(error);
      expect(result.errors[0].message).toBe("Something went wrong");
    });

    it("should create error with optional properties", () => {
      const error: IError = {
        message: "Validation failed",
        reasonCode: "INVALID_INPUT",
        context: { field: "email" },
      };
      const result = fail(error);
      const resultError = result.errors[0];
      expect(resultError.message).toBe("Validation failed");
      expect(resultError.reasonCode).toBe("INVALID_INPUT");
      expect(resultError.context).toEqual({ field: "email" });
    });
  });

  describe("ISuccess", () => {
    it("should create success with message", () => {
      const success: ISuccess = { message: "Operation completed" };
      const result = ok(42).withSuccess(success);
      expect(result.getSuccesses()[0].message).toBe("Operation completed");
    });

    it("should create success with optional properties", () => {
      const success: ISuccess = {
        message: "Data saved",
        context: { id: "123" },
      };
      const result = ok(42).withSuccess(success);
      const resultSuccess = result.getSuccesses()[0];
      expect(resultSuccess.message).toBe("Data saved");
      expect(resultSuccess.context).toEqual({ id: "123" });
    });
  });

  describe("IMetadata", () => {
    it("should attach metadata to successful result", () => {
      const metadata: IMetadata = {
        timestamp: new Date(),
        requestId: "123",
        custom: { source: "test" },
      };
      const result = ok(42, metadata);
      expect(result.getMetadata()).toEqual(metadata);
    });

    it("should attach metadata to failed result", () => {
      const metadata: IMetadata = {
        timestamp: new Date(),
        requestId: "123",
      };
      const result = fail("Error").withMetadata(metadata);
      expect(result.getMetadata()).toEqual(metadata);
    });

    it("should attach metadata to async result", async () => {
      const metadata: IMetadata = {
        timestamp: new Date(),
        requestId: "123",
      };
      const result = await okAsync(42, metadata);
      expect(result.getMetadata()).toEqual(metadata);
    });
  });

  describe("Type Guards", () => {
    it("should correctly identify successful Result", () => {
      const result = ok(42);
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
    });

    it("should correctly identify failed Result", () => {
      const result = fail("Error");
      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
    });

    it("should correctly identify successful ResultAsync", async () => {
      const result = await okAsync(42);
      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
    });

    it("should correctly identify failed ResultAsync", async () => {
      const result = await failAsync("Error");
      expect(result.isSuccess).toBe(false);
      expect(result.isFailure).toBe(true);
    });
  });

  describe("Generic Type Handling", () => {
    it("should preserve value type in Result", () => {
      const numberResult = ok(42);
      const stringResult = ok("hello");
      const objectResult = ok({ id: 1 });

      expect(numberResult.value).toBe(42);
      expect(stringResult.value).toBe("hello");
      expect(objectResult.value).toEqual({ id: 1 });
    });

    it("should preserve value type in ResultAsync", async () => {
      const numberResult = await okAsync(42);
      const stringResult = await okAsync("hello");
      const objectResult = await okAsync({ id: 1 });

      expect(await numberResult.value).toBe(42);
      expect(await stringResult.value).toBe("hello");
      expect(await objectResult.value).toEqual({ id: 1 });
    });

    it("should handle complex generic types", async () => {
      interface User {
        id: number;
        name: string;
      }

      const userResult = ok<User>({ id: 1, name: "John" });
      const asyncUserResult = await okAsync<User>({ id: 1, name: "John" });

      expect(userResult.value).toEqual({ id: 1, name: "John" });
      expect(await asyncUserResult.value).toEqual({ id: 1, name: "John" });
    });
  });
});
