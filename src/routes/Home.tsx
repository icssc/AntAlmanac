import { useState } from 'react';
import { Box, Grid, Tab, Tabs, useMediaQuery } from '@mui/material';
import Header from '$components/Header';
import Actions from '$components/Actions';
import Calendar from '$components/Calendar';

/**
 * home page
 */
export default function Home() {
  const isMobileScreen = useMediaQuery('(max-width:750px)');
  const [value, setValue] = useState(0);

  function handleChange(_event: React.SyntheticEvent, newValue: number) {
    setValue(newValue);
  }

  return (
    <Box>
      <Header />
      <Actions />
      {isMobileScreen && (
        <>
          <Tabs value={value} onChange={handleChange}>
            <Tab label="Item One" />
            <Tab label="Item Two" />
          </Tabs>
          {value === 0 && <Box>0</Box>}
          {value === 1 && <Box>1</Box>}
        </>
      )}

      {!isMobileScreen && (
        <Grid container spacing={2} columns={2}>
          <Grid item xs={1}>
            <Box sx={{ height: '90vh', overflow: 'auto' }}>
              <Calendar />
            </Box>
          </Grid>
          <Grid item xs={1} sx={{ height: '90vh', bgcolor: 'red' }}>
            <Box>HEHE</Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
