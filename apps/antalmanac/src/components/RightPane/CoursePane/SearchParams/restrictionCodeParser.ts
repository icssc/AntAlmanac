import { WebsocRestrictionCodeSchema, type WebsocRestrictionCode } from '@packages/antalmanac-types';
import { createParser, parseAsArrayOf, parseAsStringLiteral } from 'nuqs';

const restrictionCodeItemParser = parseAsStringLiteral(WebsocRestrictionCodeSchema.options);

const restrictionCodeArrayParser = parseAsArrayOf(restrictionCodeItemParser);

function parseLegacyExcludeRestrictionCodes(value: string): WebsocRestrictionCode[] {
    return [...value].flatMap((code) => {
        const parsed = WebsocRestrictionCodeSchema.safeParse(code);
        return parsed.success ? [parsed.data] : [];
    });
}

export function parseExcludeRestrictionCodeSelection(value: string | string[]): WebsocRestrictionCode[] {
    const parts = Array.isArray(value) ? value : [value];
    return parts.flatMap((code) => {
        const parsed = WebsocRestrictionCodeSchema.safeParse(code);
        return parsed.success ? [parsed.data] : [];
    });
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
