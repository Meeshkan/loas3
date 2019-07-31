import fs from "fs";
import loas from "..";
import jsYaml from "js-yaml";
import { chain, mapLeft, Either, fold, tryCatch } from "fp-ts/lib/Either";
import { OpenAPIObject } from "../generated/full";
import { pipe } from "fp-ts/lib/pipeable";
import { ErrorObject } from "ajv";
import { ILoasError } from "./interfaces";

type Try<T> = Either<ILoasError, T>;

function parseYamlFileToObject(pathToFile: string): Try<any> {
  return tryCatch(
    () => {
      const contents = fs.readFileSync(pathToFile, "utf-8");
      return jsYaml.safeLoad(contents);
    },
    (e: unknown) => ({ message: `Error reading file: ${JSON.stringify(e)}` })
  );
}

const expandSpec = (spec: any): Try<OpenAPIObject> =>
  pipe(
    spec,
    loas,
    // Map error to be compatible with IError
    mapLeft((error: ErrorObject[]) => ({
      message: `Error parsing spec: ${JSON.stringify(error)}`,
    }))
  );

export default function expand(
  pathToFile: string
): Either<ILoasError, OpenAPIObject> {
  return pipe(
    pathToFile,
    parseYamlFileToObject,
    chain(expandSpec)
  );
}
