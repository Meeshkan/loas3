import { JSONValue } from "../model/LazyOpenApi";
import { SchemaObject } from "openapi3-ts";

// only the necessary to establish - this can even theoretically be shorter
const SCHEMA_PROPERTIES = new Set([
  "properties",
  "type",
  "additionalProperties",
  "xml"
]);

export const isTopLevelSchema = (o: unknown): o is SchemaObject =>
  o &&
  typeof o === "object" &&
  Object.keys(<object>o).filter(i => SCHEMA_PROPERTIES.has(i)).length > 0;

const _ = (o: JSONValue): SchemaObject =>
  o instanceof Array
    ? {
        type: "array",
        items: o.length !== 0 ? _(o[0]) : { type: "string" } //defaults to string
      }
    : typeof o === "object"
    ? {
        type: "object",
        ...(Object.keys(<object>o).length !== 0
          ? {
              properties: Object.entries(<object>o)
                .map(([k, v]) => ({ [k]: _(v) }))
                .reduce((a, b) => ({ ...a, ...b }), {})
            }
          : {})
      }
    : {
        default: o,
        ...(typeof o === "number" && Math.floor(o) === o
          ? { format: "int64" }
          : typeof o === "number"
          ? { format: "double" }
          : {}),
        type:
          typeof o === "number" && Math.floor(o) === o
            ? "integer"
            : typeof o === "number"
            ? "number"
            : typeof o === "boolean"
            ? "boolean"
            : o === null
            ? "null"
            : "string"
      };

export default _;
