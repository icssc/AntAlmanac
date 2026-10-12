export const ImportSource = {
    ZOT_COURSE_IMPORT: 'zotcourse',
    STUDY_LIST_IMPORT: 'studylist',
    AA_USERNAME_IMPORT: 'username',
    JSON_IMPORT: 'json',
} as const;

export type ImportSource = (typeof ImportSource)[keyof typeof ImportSource];
