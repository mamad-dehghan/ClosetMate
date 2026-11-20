import { describe, expect, test } from "bun:test";
import {
  isValidEmail,
  isValidPassword,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "./auth-utils";

describe("auth input helpers", () => {
  test("normalizes email addresses", () => {
    expect(normalizeEmail("  Demo@ClosetMate.App ")).toBe("demo@closetmate.app");
    expect(normalizeEmail(undefined)).toBe("");
  });

  test("validates email addresses", () => {
    expect(isValidEmail("demo@closetmate.app")).toBe(true);
    expect(isValidEmail("demo@closetmate")).toBe(false);
    expect(isValidEmail("demo closetmate.app")).toBe(false);
  });

  test("enforces the password length window", () => {
    expect(isValidPassword("a".repeat(MIN_PASSWORD_LENGTH))).toBe(true);
    expect(isValidPassword("a".repeat(MIN_PASSWORD_LENGTH - 1))).toBe(false);
    expect(isValidPassword("a".repeat(MAX_PASSWORD_LENGTH))).toBe(true);
    expect(isValidPassword("a".repeat(MAX_PASSWORD_LENGTH + 1))).toBe(false);
  });
});
