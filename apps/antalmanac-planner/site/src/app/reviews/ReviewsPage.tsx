'use client';
import { FC, useEffect } from 'react';
import UserReviews from './UserReviews';
import Error from '../../component/Error/Error';
import { useIsLoggedIn } from '../../hooks/isLoggedIn';

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
