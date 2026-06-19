export type SkeletonBlueprint = {
    dayOffset: number;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
};

export const skeletonBlueprintVariations: SkeletonBlueprint[][] = [
    [
        { dayOffset: 0, startHour: 12, startMinute: 0, endHour: 12, endMinute: 50 },

        { dayOffset: 1, startHour: 11, startMinute: 0, endHour: 12, endMinute: 20 },
        { dayOffset: 1, startHour: 17, startMinute: 0, endHour: 18, endMinute: 20 },

        { dayOffset: 3, startHour: 11, startMinute: 0, endHour: 12, endMinute: 20 },
        { dayOffset: 3, startHour: 17, startMinute: 0, endHour: 18, endMinute: 20 },

        { dayOffset: 4, startHour: 9, startMinute: 0, endHour: 9, endMinute: 50 },
        { dayOffset: 4, startHour: 15, startMinute: 0, endHour: 15, endMinute: 50 },
    ],
    [
        { dayOffset: 0, startHour: 9, startMinute: 0, endHour: 9, endMinute: 50 },
        { dayOffset: 0, startHour: 11, startMinute: 0, endHour: 11, endMinute: 50 },
        { dayOffset: 0, startHour: 17, startMinute: 0, endHour: 18, endMinute: 50 },

        { dayOffset: 2, startHour: 9, startMinute: 0, endHour: 9, endMinute: 50 },
        { dayOffset: 2, startHour: 11, startMinute: 0, endHour: 11, endMinute: 50 },

        { dayOffset: 3, startHour: 14, startMinute: 0, endHour: 15, endMinute: 20 },

        { dayOffset: 4, startHour: 9, startMinute: 0, endHour: 9, endMinute: 50 },
        { dayOffset: 4, startHour: 11, startMinute: 0, endHour: 11, endMinute: 50 },
    ],
    [
        { dayOffset: 0, startHour: 9, startMinute: 0, endHour: 9, endMinute: 50 },
        { dayOffset: 0, startHour: 18, startMinute: 0, endHour: 18, endMinute: 50 },

        { dayOffset: 1, startHour: 8, startMinute: 0, endHour: 9, endMinute: 20 },
        { dayOffset: 1, startHour: 12, startMinute: 30, endHour: 13, endMinute: 50 },
        { dayOffset: 1, startHour: 18, startMinute: 30, endHour: 19, endMinute: 50 },

        { dayOffset: 3, startHour: 8, startMinute: 0, endHour: 9, endMinute: 20 },
        { dayOffset: 3, startHour: 12, startMinute: 30, endHour: 13, endMinute: 50 },
        { dayOffset: 3, startHour: 18, startMinute: 0, endHour: 18, endMinute: 50 },

        { dayOffset: 4, startHour: 13, startMinute: 0, endHour: 13, endMinute: 50 },
    ],
    [
        { dayOffset: 0, startHour: 12, startMinute: 0, endHour: 12, endMinute: 50 },

        { dayOffset: 1, startHour: 9, startMinute: 30, endHour: 10, endMinute: 50 },
        { dayOffset: 1, startHour: 15, startMinute: 30, endHour: 16, endMinute: 50 },
        { dayOffset: 1, startHour: 17, startMinute: 0, endHour: 18, endMinute: 20 },

        { dayOffset: 2, startHour: 13, startMinute: 0, endHour: 13, endMinute: 50 },

        { dayOffset: 3, startHour: 9, startMinute: 30, endHour: 10, endMinute: 50 },
        { dayOffset: 3, startHour: 15, startMinute: 30, endHour: 16, endMinute: 50 },
        { dayOffset: 3, startHour: 17, startMinute: 0, endHour: 18, endMinute: 20 },
    ],
];
