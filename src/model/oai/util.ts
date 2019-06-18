type det = (u: unknown) => boolean;

type _L = {
  readonly l: any;
};

export class L implements _L {
  public readonly l: any;
  constructor(u: any) {
    this.l = u;
  }
}

const evalUnion = (obj: any, l: Array<string | det | _L>): boolean =>
  l.length === 0
    ? false
    : obj &&
      (typeof l[0] === "string"
        ? typeof obj === l[0]
        : l[0] instanceof L
        ? (l[0] as L).l === obj
        : (l[0] as det)(obj))
    ? true
    : evalUnion(obj, l.slice(1));

// TODO: combine?
import * as t from "io-ts";

const doYes = (
  obj: any,
  l: Array<[string, string | det | _L | Array<string | det | _L>]>
): boolean =>
  l.length === 0
    ? true
    : obj[l[0][0]] &&
      (typeof l[0][1] === "string"
        ? typeof obj[l[0][0]] === l[0][1]
        : typeof l[0][1] === "function"
        ? l[0][1](obj[l[0][0]])
        : l[0][1] instanceof L
        ? l[0][1].l === obj[l[0][0]]
        : evalUnion(obj[l[0][0]], l[0][1] as Array<string | det | _L>))
    ? doYes(obj, l.slice(1))
    : false;
// TODO: combine?
const doMaybe = (
  obj: any,
  l: Array<[string, string | det | _L | Array<string | det | _L>]>
): boolean =>
  l.length === 0
    ? true
    : !obj[l[0][0]] ||
      (typeof l[0][1] === "string"
        ? typeof obj[l[0][0]] === l[0][1]
        : typeof l[0][1] === "function"
        ? l[0][1](obj[l[0][0]])
        : l[0][1] instanceof L
        ? l[0][1].l === obj[l[0][0]]
        : evalUnion(obj[l[0][0]], l[0][1] as Array<string | det | _L>))
    ? doMaybe(obj, l.slice(1))
    : false;

const x = (u: unknown, good: string[]) =>
  Object.keys(u as any).filter(
    i => good.indexOf(i) === -1 && i.substring(0, 2) !== "x-"
  ).length === 0;
export const _is = <T>(
  yes: { [s: string]: string | det | _L | Array<string | det | _L> },
  maybe: { [s: string]: string | det | _L | Array<string | det | _L> }
) => (u: unknown): u is T =>
  typeof u === "object" &&
  doYes(u, Object.entries(yes)) &&
  doMaybe(u, Object.entries(maybe)) &&
  x(u, Object.keys(yes).concat(Object.keys(maybe)));

type Validator<T> = (u: unknown) => u is T;

export const _type = <T>(name: string, validator: Validator<T>) =>
  new t.Type<T>(
    name,
    validator,
    (u, c) => (validator(u) ? t.success(u) : t.failure(u, c)),
    t.identity
  );
