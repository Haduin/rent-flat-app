export const isNullable = <T>(val: T | null | undefined): val is undefined | null =>
  val === null || val === undefined;
