import { describe, expect, test } from "bun:test";
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  test("verifies the original password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
  });

  test("rejects a different password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("Correct horse battery staple", hash)).toBe(false);
  });

  test("salts each hash", async () => {
    const first = await hashPassword("same-password");
    const second = await hashPassword("same-password");
    expect(first).not.toBe(second);
  });

  test("rejects empty, missing and malformed hashes", async () => {
    expect(await verifyPassword("anything", null)).toBe(false);
    expect(await verifyPassword("anything", "")).toBe(false);
    expect(await verifyPassword("anything", "plain-text")).toBe(false);
    expect(await verifyPassword("anything", "scrypt$zz$zz")).toBe(false);
  });

  test("the dummy hash runs but does not match a normal password", async () => {
    expect(await verifyPassword("password123", DUMMY_PASSWORD_HASH)).toBe(false);
  });
});
