import React, { Suspense } from 'react';
import { isDarkMode } from '../../../helpers';
import darkModeLoadingGif from '../CoursePane/SearchForm/Gifs/dark-loading.gif';
import loadingGif from '../CoursePane/SearchForm/Gifs/loading.gif';

const LazyUCIMap = () => {
    const UCIMap = React.lazy(() => import('./UCIMap'));
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <img src={isDarkMode() ? darkModeLoadingGif : loadingGif} alt="Loading map" />
                </div>
            }
        >
            <UCIMap />
        </Suspense>
    );
};

export default LazyUCIMap;
