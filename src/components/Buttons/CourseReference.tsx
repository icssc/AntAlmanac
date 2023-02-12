import { useState } from 'react';
import { Button, Popover } from '@mui/material';
import { analyticsEnum, logAnalytics } from '$lib/analytics';

interface CourseInfoButtonProps {
  title: string;
  icon: React.ReactElement;
  analyticsAction: string;
  href?: string;
  children?: React.ReactElement;
}

export default function CourseReferenceButton(props: CourseInfoButtonProps) {
  const { title, icon, href, children, analyticsAction } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    logAnalytics({
      category: analyticsEnum.classSearch.title,
      action: analyticsAction,
    });

    if (href) {
      window.open(href);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button variant="contained" size="small" onClick={handleClick} startIcon={icon}>
        {title}
      </Button>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {children}
      </Popover>
    </>
  );
}
