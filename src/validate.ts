import rfqEvent from "../schema/rfq-event.json";
import example from "../data/example.json";
import {RfqEvent} from "./types";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({removeAdditional: true});
addFormats(ajv);
const validator = ajv.compile<RfqEvent>(rfqEvent);

if (!validator(example)) {
    throw new Error(`Validation failed:\n${JSON.stringify(validator.errors, null, 2)}`);
}
const validated: RfqEvent = example;
console.log("Validated!", validated);
