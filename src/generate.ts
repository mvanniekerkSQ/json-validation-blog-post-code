import * as tsj from "ts-json-schema-generator";
import {Config} from "ts-json-schema-generator";
import fs from "node:fs";
import path from "node:path";

async function writeFile(pathStr: string, data: any) {
    return new Promise<void>((resolve, reject) => {
        fs.mkdir(path.dirname(pathStr), {recursive: true}, err => {
            if (err) {
                reject(err);
            }
            fs.writeFile(pathStr, data, (err) => {
                return err ? reject(err) : resolve();
            })
        });
    });
}

const config: Config = {
    path: "src/types.ts",
    type: "RfqEvent",
    jsDoc: "extended",
}

const schema = tsj.createGenerator(config).createSchema(config.type);
const schemaString = JSON.stringify(schema, undefined, 2);
writeFile("schema/rfq-event.json", schemaString);
