import { useParams, Link } from 'react-router-dom'
import { Paper, Tab, Tabs, Typography } from '@material-ui/core';
import { FormatListBulleted, MyLocation, Search } from '@material-ui/icons';
import React, { Suspense } from 'react';

import AddedCoursePane from './AddedCourses/AddedCoursePane';
import CoursePane from './CoursePane/CoursePaneRoot';
import darkModeLoadingGif from './CoursePane/SearchForm/Gifs/dark-loading.gif';
import loadingGif from './CoursePane/SearchForm/Gifs/loading.gif';
import RightPaneStore from './RightPaneStore';
import { isDarkMode } from '$lib/helpers';

const UCIMap = React.lazy(() => import('../Map'));

const styles = {
  fallback: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

interface DesktopTabsProps {
  style: Record<string, unknown>;
}

export default function Desktop({ style }: DesktopTabsProps) {
  const params = useParams()

  const currentTabIndex = params.tab === 'added' ? 1 : params.tab === 'map' ? 2 : 0;

  const tabs = [
    {
      label: 'Search',
      href: '/',
      icon: Search,
    },
    {
      label: 'Added',
      href: '/added',
      icon: FormatListBulleted,
    },
    {
      label: 'Map',
      href: '/map',
      icon: MyLocation,
    }
  ]

  const tabContents = [
    <CoursePane />,
    <AddedCoursePane />,
    <Suspense
      fallback={
        <div style={styles.fallback}>
          <img src={isDarkMode() ? darkModeLoadingGif : loadingGif} alt="Loading map" />
        </div>
      }
    >
      <UCIMap />
    </Suspense>
  ]


  return (
    <div style={style}>
      <Paper
        elevation={0}
        variant="outlined"
        square
        style={{
          overflow: 'hidden',
          margin: '0 4px 4px 4px',
        }}
      >
        <Tabs
          value={currentTabIndex}
          onChange={RightPaneStore.handleTabChange}
          indicatorColor="primary"
          variant="fullWidth"
          centered
          style={{ height: '48px' }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.label}
              component={Link}
              label={
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <tab.icon style={{ height: 16 }} />
                  <Typography variant="body2">{tab.label}</Typography>
                </div>
              }
              to={tab.href}
              style={{ minHeight: 'auto', height: '44px', padding: 3 }}
            />
          ))}
        </Tabs>
      </Paper>
      <div
        style={{
          padding: RightPaneStore.getActiveTab() === 2 ? '0px' : '8px 8px 0 8px',
          height: `calc(100% - 54px)`,
          overflowY: 'auto',
        }}
      >
        {tabContents[currentTabIndex]}
      </div>
    </div>
  );
}
