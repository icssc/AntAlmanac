import { createContext, useEffect, useState } from 'react';
import AppStore from '$stores/AppStore';
import { is24HourTime } from '$lib/helpers';

interface Props {
    children?: React.ReactNode;
}

type TimeFormatContextType = {
    context: boolean;
    setContext: React.Dispatch<React.SetStateAction<boolean>>;
};

const defaultTimeFormatContextState = {
    context: false,
    setContext: () => {
        return false;
    },
};

const Show24HourTimeContext = createContext<TimeFormatContextType>(defaultTimeFormatContextState);

export default function Show24HourTimeProvider(props: Props) {
    const [on24HourTime, setShow24HourTime] = useState(is24HourTime());

    useEffect(() => {
        console.log('using effect');
        AppStore.on('show24HourToggle', () => {
            setShow24HourTime(is24HourTime());
        });
    }, []);

    return (
        <Show24HourTimeContext.Provider value={{ context: on24HourTime, setContext: setShow24HourTime }}>
            {props.children}
        </Show24HourTimeContext.Provider>
    );
}
