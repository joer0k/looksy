import { ApiError, NetworkError } from "@/lib/api";
import type { Dictionary } from "./ru";

/** A message resolved at render time, so it follows language switches. */
export type Translatable = (t: Dictionary) => string;

type ApiErrorKey = keyof Dictionary["apiErrors"];

// Backend messages are English and stable; match on fragments so pydantic
// prefixes such as "Value error, " don't matter.
const KNOWN_MESSAGES: Array<[fragment: string, key: ApiErrorKey]> = [
  ["incorrect email or password", "invalidCredentials"],
  ["inactive", "inactive"],
  ["already exists", "emailTaken"],
  ["uppercase", "passwordUppercase"],
  ["digit", "passwordDigit"],
  ["passwords do not match", "passwordMismatch"],
  ["at least 14", "tooYoung"],
  ["terms must be accepted", "terms"],
  ["valid email", "invalidEmail"],
  ["item not found", "itemNotFound"],
  ["unsupported media type", "unsupportedMedia"],
  ["empty file", "emptyFile"],
  ["image too large", "imageTooLarge"],
  ["no data provided", "noChanges"],
];

function translateMessage(message: string, t: Dictionary) {
  const lower = message.toLowerCase();
  const match = KNOWN_MESSAGES.find(([fragment]) => lower.includes(fragment));
  return match ? t.apiErrors[match[1]] : message;
}

type ValidationIssue = { msg?: string; loc?: unknown[]; type?: string };

function translateIssue(issue: ValidationIssue, t: Dictionary) {
  const field = issue.loc?.at(-1);
  if (field === "password" && issue.type?.startsWith("string_too")) return t.apiErrors.passwordLength;
  if (field === "email") return t.apiErrors.invalidEmail;
  return issue.msg ? translateMessage(issue.msg, t) : null;
}

/**
 * Turns anything thrown by the API layer into a message in the current
 * language. `fallback` is used when the server gives no usable detail.
 */
export function describeError(error: unknown, t: Dictionary, fallback: string) {
  if (error instanceof NetworkError) return t.common.networkError;
  if (!(error instanceof ApiError)) return fallback;
  if (error.status === 401 && error.detail !== "Incorrect email or password") return t.apiErrors.sessionExpired;

  if (typeof error.detail === "string") return translateMessage(error.detail, t);
  if (Array.isArray(error.detail)) {
    const messages = [...new Set((error.detail as ValidationIssue[]).map((issue) => translateIssue(issue, t)))];
    const text = messages.filter(Boolean).join(" ");
    if (text) return text;
  }
  return fallback;
}

export function isUnauthorized(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}
