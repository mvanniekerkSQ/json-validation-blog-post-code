import Ajv from "ajv";
import rfqEvent from "../schema/rfq-event.json";
import example from "../data/example.json";
import {RfqEvent} from "./types";
import addFormats from "ajv-formats";

const ajv = new Ajv();
addFormats(ajv);
const validator = ajv.compile<RfqEvent>(rfqEvent);

if (validator(example)) {
    console.log("Validated!");
} else {
    console.log(validator.errors);
}
