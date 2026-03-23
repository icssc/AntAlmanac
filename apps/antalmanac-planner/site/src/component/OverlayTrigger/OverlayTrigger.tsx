'use client';
import React, { FC, ReactNode, useState } from 'react';
import { Popover } from '@mui/material';
import './OverlayTrigger.scss';

interface OverlayTriggerProps {
  popoverContent: ReactNode;
  children: React.ReactElement;
  popupListener?: (open: boolean) => void;
  disabled?: boolean;
  anchor: 'bottom' | 'left' | 'right';
  transform: 'bottom' | 'left' | 'right';
}

const anchorMap = {
  bottom: { vertical: 'bottom', horizontal: 'center' } as const,
  left: { vertical: 'center', horizontal: 'left' } as const,
  right: { vertical: 'center', horizontal: 'right' } as const,
};

const transformMap = {
  bottom: { vertical: 'top', horizontal: 'center' } as const,
  left: { vertical: 'center', horizontal: 'right' } as const,
  right: { vertical: 'center', horizontal: 'left' } as const,
};

const OverlayTrigger: FC<OverlayTriggerProps> = ({
  popoverContent,
  children,
  popupListener,
  disabled = false,
  anchor,
  transform,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const showPopover = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      return;
    }

    setAnchorEl(event.currentTarget);
    popupListener?.(true);
  };

  const hidePopover = () => {
    setAnchorEl(null);
    popupListener?.(false);
  };

  const handleUnhover = (e: React.MouseEvent) => {
    const relatedTarget = e.relatedTarget as Node | null;
    const popoverContent = document.querySelector('.hoverable-popover');

    if (!popoverContent || !relatedTarget || !popoverContent.contains(relatedTarget)) {
      hidePopover();
    }
  };

  const clonedChild = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      showPopover(e);
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      handleUnhover(e);
      children.props.onMouseLeave?.(e);
    },
  });

  return (
    <div className="overlay-trigger">
      {clonedChild}
      <Popover
        className="popover-root"
        open={open}
        anchorEl={anchorEl}
        onClose={hidePopover}
        disableRestoreFocus
        anchorOrigin={anchorMap[anchor]}
        transformOrigin={transformMap[transform]}
        slotProps={{
          paper: {
            className: 'hoverable-popover',
            onMouseLeave: hidePopover,
          },
        }}
      >
        {popoverContent}
      </Popover>
    </div>
  );
};

export default OverlayTrigger;
