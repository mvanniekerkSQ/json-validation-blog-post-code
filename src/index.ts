import Ajv from "ajv";
import data from "../data/bug.json";

const ajv = new Ajv();
const validator = ajv.compile<{type_discriminator: "my_type"}>(data);

const matches = validator({type_discriminator: "oops"});
console.log("matches?", matches);
