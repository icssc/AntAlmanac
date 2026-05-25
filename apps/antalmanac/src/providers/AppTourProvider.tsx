import { removeSampleClasses } from '$lib/tourExampleGeneration';
import { TourProvider } from '@reactour/tour';

interface Props {
    children?: React.ReactNode;
}

export default function AppTourProvider({ children }: Props) {
    return (
        <TourProvider
            steps={[] /** Will be populated by Tutorial component */}
            padding={5}
            beforeClose={() => {
                removeSampleClasses();
            }}
            styles={{
                maskArea: (base) => ({
                    ...base,
                    rx: 5,
                }),
                maskWrapper: (base) => ({
                    ...base,
                    color: 'rgba(0, 0, 0, 0.3)',
                }),
                popover: (base) => ({
                    ...base,
                    background: '#fff',
                    color: 'black',
                    borderRadius: 5,
                    boxShadow: '0 0 10px #000',
                    padding: 20,
                    paddingTop: 40,
                    margin: '4px 20px 20px 20px',
                }),
            }}
        >
            {children}
        </TourProvider>
    );
}
