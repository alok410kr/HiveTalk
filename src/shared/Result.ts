// Shared Result type for handling success/failure without exceptions

export type Result<T, E = string> = 
  | { success: true; value: T }
  | { success: false; error: E; statusCode?: number };

export const Result = {
  ok<T, E = string>(value: T): Result<T, E> {
    return { success: true, value };
  },

  fail<E = string>(error: E, statusCode?: number): Result<never, E> {
    return { success: false, error, statusCode };
  },

  isOk<T, E>(result: Result<T, E>): result is { success: true; value: T } {
    return result.success === true;
  },

  isFail<T, E>(result: Result<T, E>): result is { success: false; error: E } {
    return result.success === false;
  },

  // Unwrap value or throw
  unwrap<T>(result: Result<T>): T {
    if (result.success) {
      return result.value;
    }
    throw new Error(String(result.error));
  },

  // Get value or default
  unwrapOr<T>(result: Result<T>, defaultValue: T): T {
    if (result.success) {
      return result.value;
    }
    return defaultValue;
  },

  // Map over successful value
  map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    if (result.success) {
      return Result.ok(fn(result.value));
    }
    return result;
  },

  // Chain results
  flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
    if (result.success) {
      return fn(result.value);
    }
    return result;
  },

  // Combine multiple results
  combine<T>(results: Result<T>[]): Result<T[]> {
    const values: T[] = [];
    for (const result of results) {
      if (!result.success) {
        return result;
      }
      values.push(result.value);
    }
    return Result.ok(values);
  },
};

// Type guard helper
export function isResult<T>(value: unknown): value is Result<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof (value as Result<T>).success === "boolean"
  );
}
