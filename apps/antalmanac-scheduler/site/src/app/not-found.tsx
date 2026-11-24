import { AuthInitializer } from '$components/AuthInitializer';
import { Header } from '$components/Header/Header';
import { SchedulerNotFound } from '@antalmanac-planner/site/src/app/SiteNotFound';

export default function NotFound() {
    return (
        <>
            <AuthInitializer />
            <Header />
            <SchedulerNotFound />
        </>
    );
}
