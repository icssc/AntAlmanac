export interface DevTool {
    id: string;
    label: string;
    description: string;
}

export const DEV_TOOLS: DevTool[] = [
    {
        id: 'json-import-export',
        label: 'JSON Import/Export',
        description: 'Import and export schedules as JSON files',
    },
];
