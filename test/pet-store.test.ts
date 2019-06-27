import fs from "fs";
import yaml from "js-yaml";
import loas from "../src";
import { lazy } from "./util";

test("processing on unlazy schema is a no-op", () => {
  const instance = yaml.load(
    fs.readFileSync("./test/pet-store.yml").toString()
  );
  lazy(loas(instance), val => {
    expect(val).toEqual(instance);
  });
});
