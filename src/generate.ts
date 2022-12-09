import {Config, createFormatter, createParser, createProgram, SchemaGenerator} from "ts-json-schema-generator";
import fs from "node:fs";
import path from "node:path";
import {UnionTypeFormatterWithDiscriminatorFix} from "./unionTypeFormatterWithDiscriminatorFix";

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

const formatter = createFormatter(config, (fmt, circularReferenceTypeFormatter) => {
    fmt.addTypeFormatter(new UnionTypeFormatterWithDiscriminatorFix(circularReferenceTypeFormatter));
});
const program = createProgram(config);
const parser = createParser(program, config);
const generator = new SchemaGenerator(program, parser, formatter, config);
const schema = generator.createSchema(config.type);
const schemaString = JSON.stringify(schema, undefined, 2);
writeFile("schema/rfq-event.json", schemaString);
