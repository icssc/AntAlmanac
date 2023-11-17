import { ScheduleCourse } from '@packages/antalmanac-types';
import { ReactourStep } from 'reactour';
import { create } from 'zustand';
import AppStore from '$stores/AppStore';
import { sampleClassFactory } from '$lib/tourUtils';

function addSampleClasses() {
    if (AppStore.getAddedCourses().length > 0) return;

    const sampleClasses: Array<ScheduleCourse> = [
        {
            courseTitle: 'Nice',
            deptCode: 'GEN&SEX',
            courseNumber: '69',
            instructors: ['Your mother'],
            meetings: [
                {
                    bldg: ['DBH'],
                    days: 'MWF',
                    startTime: {
                        hour: 10,
                        minute: 0,
                    },
                    endTime: {
                        hour: 10,
                        minute: 50,
                    },
                    timeIsTBA: false,
                },
            ],
        },
        {
            meetings: [
                {
                    bldg: ['ELH 100'],
                    days: 'TuTh',
                    startTime: {
                        hour: 9,
                        minute: 30,
                    },
                    endTime: {
                        hour: 10,
                        minute: 50,
                    },
                    timeIsTBA: false,
                },
            ],
        },
    ].map(sampleClassFactory);

    sampleClasses.forEach((sampleClass) => {
        AppStore.addCourse(sampleClass);
    });
}

export const tourSteps: Array<ReactourStep> = [
    {
        selector: '#searchBar',
        content: 'You can search for your classes here!',
    },
    {
        selector: '#import-button',
        content: 'Quickly add your classes from WebReg or Zotcourse!',
    },
    {
        selector: '.rbc-time-view', // Calendar.
        content: 'See the classes in your schedule!',
        action: addSampleClasses,
    },
    {
        selector: '#finals-button',
        content: 'See your finals times',
    },
];

interface TourStore {
    tourEnabled: boolean;
    setTourEnabled: (enabled: boolean) => void;
    enableTour: () => void;
    disableTour: () => void;
}

export const useTourStore = create<TourStore>((set, get) => {
    return {
        tourEnabled: true, // TODO: Check localstorage
        setTourEnabled: (enabled: boolean) => set({ tourEnabled: enabled }),
        enableTour: () => set({ tourEnabled: true }),
        disableTour: () => set({ tourEnabled: false }),
    };
});

export default useTourStore;
