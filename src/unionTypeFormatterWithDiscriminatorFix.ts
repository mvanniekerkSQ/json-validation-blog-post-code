import {
    BaseType,
    Definition,
    derefType,
    getTypeByKey,
    LiteralType,
    NeverType,
    SubTypeFormatter,
    TypeFormatter,
    UnionType,
    uniqueArray
} from "ts-json-schema-generator";
import {JSONSchema7} from "json-schema";

/**
 * This is a copy of the UnionTypeFormatter from ts-json-schema-generator, but with a fix for the discriminator.
 */
export class UnionTypeFormatterWithDiscriminatorFix implements SubTypeFormatter {
    public constructor(protected childTypeFormatter: TypeFormatter) {}

    public supportsType(type: UnionType): boolean {
        return type instanceof UnionType;
    }

    public getDefinition(type: UnionType): Definition {
        const definitions = type
            .getTypes()
            .filter((item) => !(derefType(item) instanceof NeverType))
            .map((item) => this.childTypeFormatter.getDefinition(item));

        const discriminator = type.getDiscriminator();
        if (discriminator !== undefined) {
            const kindTypes = type
                .getTypes()
                .filter((item) => !(derefType(item) instanceof NeverType))
                .map((item) => getTypeByKey(item, new LiteralType(discriminator)));

            const undefinedIndex = kindTypes.indexOf(undefined);

            if (undefinedIndex != -1) {
                throw new Error(
                    `Cannot find discriminator keyword "${discriminator}" in type ${JSON.stringify(
                        type.getTypes()[undefinedIndex]
                    )}.`
                );
            }

            const kindDefinitions = kindTypes.map((item) => this.childTypeFormatter.getDefinition(item as BaseType));

            const allOf = [];

            for (const [i, definition] of definitions.entries()) {
                allOf.push({
                    if: {
                        properties: {[discriminator]: kindDefinitions[i]},
                    },
                    then: definition,
                });
            }

            const kindValues = kindDefinitions
                .map((item) => item.const)
                .filter((item): item is string | number | boolean | null => item !== undefined);

            const duplicates = kindValues.filter((item, index) => kindValues.indexOf(item) !== index);
            if (duplicates.length > 0) {
                throw new Error(
                    `Duplicate discriminator values: ${duplicates.join(", ")} in type ${JSON.stringify(
                        type.getName()
                    )}.`
                );
            }

            const properties = {
                [discriminator]: {
                    enum: kindValues,
                },
            };

            return {type: "object", properties, required: [discriminator], allOf};
        }

        // TODO: why is this not covered by LiteralUnionTypeFormatter?
        // special case for string literals | string -> string
        let stringType = true;
        let oneNotEnum = false;
        for (const def of definitions) {
            if (def.type !== "string") {
                stringType = false;
                break;
            }
            if (def.enum === undefined) {
                oneNotEnum = true;
            }
        }
        if (stringType && oneNotEnum) {
            const values = [];
            for (const def of definitions) {
                if (def.enum) {
                    values.push(...def.enum);
                } else if (def.const) {
                    values.push(def.const);
                } else {
                    return {
                        type: "string",
                    };
                }
            }
            return {
                type: "string",
                enum: values,
            };
        }

        const flattenedDefinitions: JSONSchema7[] = [];

        // Flatten anyOf inside anyOf unless the anyOf has an annotation
        for (const def of definitions) {
            const keys = Object.keys(def);

            if (keys.length === 1 && keys[0] === "anyOf") {
                flattenedDefinitions.push(...(def.anyOf as any));
            } else {
                flattenedDefinitions.push(def);
            }
        }

        return flattenedDefinitions.length > 1
            ? {
                anyOf: flattenedDefinitions,
            }
            : flattenedDefinitions[0];
    }

    public getChildren(type: UnionType): BaseType[] {
        return uniqueArray(
            type
                .getTypes()
                // eslint-disable-next-line unicorn/no-array-reduce
                .reduce((result: BaseType[], item) => [...result, ...this.childTypeFormatter.getChildren(item)], [])
        );
    }
}
