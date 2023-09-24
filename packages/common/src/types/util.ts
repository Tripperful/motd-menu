export type ArrayElementType<T extends readonly unknown[]> =
  T extends readonly (infer U)[] ? U : never;
