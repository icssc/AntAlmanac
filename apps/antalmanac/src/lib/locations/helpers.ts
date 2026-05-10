export function getBuildingNameAcronym(name: string): string {
    const open = name.indexOf('(');
    const close = name.indexOf(')');
    if (open === -1 || close === -1 || close <= open) {
        return '';
    }
    return name.substring(open + 1, close);
}
