import { EventEmitter } from 'events';

import { trpc } from '$lib/api/trpc';
import { Schedules } from '$stores/Schedules';
import type { ShortCourseSchedule } from '@packages/antalmanac-types';

/**
 * Holds a friend's schedule data separately from the user's AppStore schedule.
 * Friend schedules are shown in a modal dialog on the home page.
 */
class FriendsStore extends EventEmitter {
    schedule: Schedules;

    private dialogOpen = false;

    private loading = false;

    private friendId: string | null = null;

    private friendName: string | null = null;

    private friendSchedules: ShortCourseSchedule[] = [];

    constructor() {
        super();
        this.schedule = new Schedules();
    }

    isDialogOpen() {
        return this.dialogOpen;
    }

    isLoading() {
        return this.loading;
    }

    getFriendId() {
        return this.friendId;
    }

    getFriendName() {
        return this.friendName;
    }

    getFriendScheduleNames(): string[] {
        return this.friendSchedules.map((schedule) => schedule.scheduleName);
    }

    getCurrentFriendSchedule(): ShortCourseSchedule {
        const schedule = this.friendSchedules[this.schedule.getCurrentScheduleIndex()];
        if (!schedule) {
            return {
                id: undefined,
                scheduleName: '',
                courses: [],
                customEvents: [],
                scheduleNote: '',
            };
        }
        return schedule;
    }

    async openFriendView(userId: string, friendName: string): Promise<boolean> {
        this.dialogOpen = true;
        this.loading = true;
        this.friendId = userId;
        this.friendName = friendName;
        this.emit('friendViewChange');

        try {
            const data = await trpc.schedule.getFriendUserData.query({ userId });

            if (!data?.userData?.schedules?.length) {
                this.dialogOpen = false;
                this.friendId = null;
                this.friendName = null;
                return false;
            }

            this.friendName = data.name ?? data.email ?? friendName;
            await this.schedule.fromScheduleSaveState(data.userData);
            this.friendSchedules = data.userData.schedules;
            this.emit('scheduleChange');
            return true;
        } catch {
            this.dialogOpen = false;
            this.friendId = null;
            this.friendName = null;
            return false;
        } finally {
            this.loading = false;
            this.emit('friendViewChange');
        }
    }

    closeFriendView() {
        this.dialogOpen = false;
        this.loading = false;
        this.friendId = null;
        this.friendName = null;
        this.friendSchedules = [];
        this.schedule = new Schedules();
        this.emit('friendViewChange');
        this.emit('scheduleChange');
    }

    returnToManageFriends() {
        this.closeFriendView();
        this.emit('openManageFriends');
    }

    changeCurrentSchedule(newScheduleIndex: number) {
        this.schedule.setCurrentScheduleIndex(newScheduleIndex);
        this.emit('scheduleChange');
    }
}

const friendsStore = new FriendsStore();

export default friendsStore;
