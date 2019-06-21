import yaml from "js-yaml";
import loas3 from "../../src/";

test("lazy openapi correctly expands parameters", () => {
  expect(
    loas3(
      yaml.load(`paths:
    '/foo/{id}':
        get:
          parameters:
              id: 3
              bar: baz
          responses:
              200: 1
`)
    ).paths
  ).toEqual({
    ["/foo/{id}"]: {
      get: {
        parameters: [
          {
            name: "id",
            in: "path",
            schema: {
              type: "integer",
              format: "int64",
              default: 3
            }
          },
          {
            name: "bar",
            in: "query",
            schema: {
              type: "string",
              default: "baz"
            }
          }
        ],
        responses: {
          200: {
            description: "too lazy",
            content: {
              ["application/json"]: {
                schema: {
                  type: "integer",
                  format: "int64",
                  default: 1
                }
              }
            }
          }
        }
      }
    }
  });
});

test("lazy openapi correctly expands segmented parameters", () => {
  expect(
    loas3(
      yaml.load(`paths:
    '/foo':
        get:
            parameters:
                query:
                  foo: bar
                header:
                  bar: foo
            responses:
                200: 1
`)
    ).paths
  ).toEqual({
    ["/foo"]: {
      get: {
        parameters: [
          {
            name: "foo",
            in: "query",
            schema: {
              type: "string",
              default: "bar"
            }
          },
          {
            name: "bar",
            in: "header",
            schema: {
              type: "string",
              default: "foo"
            }
          }
        ],
        responses: {
          200: {
            description: "too lazy",
            content: {
              ["application/json"]: {
                schema: {
                  type: "integer",
                  format: "int64",
                  default: 1
                }
              }
            }
          }
        }
      }
    }
  });
});
