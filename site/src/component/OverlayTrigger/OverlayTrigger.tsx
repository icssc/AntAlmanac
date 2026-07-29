'use client';
import React, { FC, ReactNode, useState } from 'react';
import { Popover } from '@mui/material';
import './OverlayTrigger.scss';
import { useAppSelector } from '../../store/hooks';

type OverlayTriggerChildProps = {
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseOver?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
};

interface OverlayTriggerProps {
  popoverContent: ReactNode;
  children: React.ReactElement<OverlayTriggerChildProps>;
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
  const activeCourse = useAppSelector((state) => state.roadmap.activeCourse);

  const showPopover = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled || activeCourse) {
      return;
    }

    setAnchorEl(event.currentTarget);
    popupListener?.(true);
  };

  const hidePopover = () => {
    setAnchorEl(null);
    popupListener?.(false);
  };

  const { onMouseEnter, onMouseOver, onMouseLeave } = children.props;

  const clonedChild = React.cloneElement(children, {
    onMouseEnter: (e) => {
      showPopover(e);
      onMouseEnter?.(e);
    },
    onMouseOver: (e) => {
      showPopover(e);
      onMouseOver?.(e);
    },
    onMouseLeave: (e) => {
      hidePopover();
      onMouseLeave?.(e);
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
            sx: {
              pointerEvents: 'none',
            },
          },
        }}
      >
        {popoverContent}
      </Popover>
    </div>
  );
};

export default OverlayTrigger;
