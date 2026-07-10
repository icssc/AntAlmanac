'use client';
import Error from '$planner/component/Error/Error';
import { useIsLoggedIn } from '$planner/hooks/isLoggedIn';
import { type FC, useEffect } from 'react';

import UserReviews from './UserReviews';

const ReviewsPage: FC = () => {
    const isLoggedIn = useIsLoggedIn();

    useEffect(() => {
        document.title = 'Your Reviews | AntAlmanac Planner';
    }, []);

    if (!isLoggedIn) {
        return <Error message="Access Denied: Log in to view this page."></Error>;
    }

    return <UserReviews />;
};

export default ReviewsPage;
