import { useEffect, useRef, useState } from 'react';
import { Box, Tab, Tabs, useMediaQuery } from '@mui/material';
import Calendar from '$components/Calendar';
import { ResizeContent, ResizePanel, ResizeHandleRight, ResizeHandleLeft } from 'react-hook-resize-panel';

/**
 * home page
 */
export default function Home() {
  const isMobileScreen = useMediaQuery('(max-width:750px)');
  const [value, setValue] = useState(0);

  const [width, setWidth] = useState(0);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(ref.current?.clientWidth);
    setWidth(ref.current?.clientWidth ? ref.current?.clientWidth / 2 : 0);
  }, []);

  function handleChange(_event: React.SyntheticEvent, newValue: number) {
    setValue(newValue);
  }

  if (isMobileScreen) {
    return (
      <>
        <Tabs value={value} onChange={handleChange} variant="fullWidth">
          <Tab label="Item One" />
          <Tab label="Item Two" />
        </Tabs>
        {value === 0 && <Calendar />}
        {value === 1 && <Box>1</Box>}
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexFlow: 'row nowrap', flexGrow: 1 }} ref={ref}>
      {width && (
        <>
          <ResizePanel initialWidth={width} maxWidth={10000}>
            <ResizeContent>
              <Calendar />
            </ResizeContent>
            <ResizeHandleRight>
              <Box sx={{ cursor: 'col-resize', width: 5, height: '100%', bgcolor: 'black' }} />
            </ResizeHandleRight>
          </ResizePanel>

          <ResizePanel initialWidth={width} maxWidth={10000}>
            <ResizeHandleLeft>
              <Box sx={{ cursor: 'col-resize', width: 5, height: '100%', bgcolor: 'blue' }} />
            </ResizeHandleLeft>
            <ResizeContent />
          </ResizePanel>
        </>
      )}
    </Box>
  );
}
