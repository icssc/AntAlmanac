import { WebsocRestrictionCodeSchema, type WebsocRestrictionCode } from '@packages/antalmanac-types';
import { createParser, parseAsArrayOf, parseAsStringLiteral } from 'nuqs';

const restrictionCodeItemParser = parseAsStringLiteral(WebsocRestrictionCodeSchema.options);

const restrictionCodeArrayParser = parseAsArrayOf(restrictionCodeItemParser);

const validRestrictionCodes = new Set<string>(WebsocRestrictionCodeSchema.options);

function parseLegacyExcludeRestrictionCodes(value: string): WebsocRestrictionCode[] {
    return [...value].filter((code): code is WebsocRestrictionCode => validRestrictionCodes.has(code));
}

/** Comma-separated restriction codes; also accepts legacy concatenated values (e.g. `AE` → `A`,`E`). */
export const parseAsExcludeRestrictionCodes = createParser<WebsocRestrictionCode[]>({
    parse: (value) => {
        if (!value) {
            return [];
        }

        if (!value.includes(',') && value.length > 1) {
            return parseLegacyExcludeRestrictionCodes(value);
        }

        return restrictionCodeArrayParser.parse(value) ?? [];
    },
    serialize: (values) => restrictionCodeArrayParser.serialize(values),
    eq: (a, b) => restrictionCodeArrayParser.eq(a, b),
}).withDefault([]);
