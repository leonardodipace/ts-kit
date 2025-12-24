export type ExtractParamType<T extends string> = T extends "string"
  ? string
  : T extends "number"
    ? number
    : T extends "boolean"
      ? boolean
      : never;

export type BuildParamObject<
  T extends string,
  Acc = {},
> = T extends `${infer _Start}{${infer Name}:${infer Type}}${infer Rest}`
  ? BuildParamObject<Rest, Acc & Record<Name, ExtractParamType<Type>>>
  : Acc;

export type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : `${K}`;
    }[keyof T & string]
  : never;

export type GetNestedValue<
  T,
  K extends string,
> = K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? GetNestedValue<T[First], Rest>
    : never
  : K extends keyof T
    ? T[K]
    : never;
