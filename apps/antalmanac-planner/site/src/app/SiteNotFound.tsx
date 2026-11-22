import Error from '../component/Error/Error';

function SiteNotFound({ isPlanner }: { isPlanner: boolean }) {
    return (
        <Error
            buttonHref={isPlanner ? '/planner' : '/'}
            buttonText={isPlanner ? 'Go to Roadmap' : 'Back to Schedule'}
        />
    );
}

export function PlannerNotFound() {
    return <SiteNotFound isPlanner />;
}

export function SchedulerNotFound() {
    return (
        <div className="scheduler-not-found">
            <SiteNotFound isPlanner={false} />
        </div>
    );
}
