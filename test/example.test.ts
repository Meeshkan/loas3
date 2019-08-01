import loas3 from "../src";
import { loadYaml } from "./util";
import { fold } from "fp-ts/lib/Either";
import { OpenAPIObject } from "../src/generated/full";

describe("Parsing example spec", () => {
  it("produces correct responses", () => {
    const lazySpec = loadYaml("./test/example/index.yaml");
    const expanded = loas3(lazySpec);
    fold(
      err => {
        throw err;
      },
      (val: OpenAPIObject) => {
        expect(val).toHaveProperty("openapi");
        expect(val).toHaveProperty(
          ["paths", "/user", "get", "responses", "404", "description"],
          "too lazy"
        );
        expect(val).toHaveProperty(
          [
            "paths",
            "/user",
            "get",
            "responses",
            "404",
            "content",
            "text/plain",
            "schema",
            "default"
          ],
          "Not found"
        );
      }
    )(expanded);
  });
});
