import { FC, useState, useEffect } from 'react';
import './ScrollToTopButton.scss';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface ScrollToTopButtonProps {
  scrollableTarget: string;
  raiseButton?: boolean;
}

const ScrollToTopButton: FC<ScrollToTopButtonProps> = ({ scrollableTarget, raiseButton = false }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById(scrollableTarget);
    if (!el) return;

    const onScroll = () => {
      const minScrollDistBeforeVisible = 300;
      setVisible(el.scrollTop > minScrollDistBeforeVisible);
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollableTarget]);

  const jumpToTop = () => {
    document.getElementById(scrollableTarget)?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <IconButton
      onClick={jumpToTop}
      className={`scroll-to-top-button ${raiseButton ? 'scroll-to-top-button-raised' : ''}`}
      size="large"
    >
      <KeyboardArrowUpIcon />
    </IconButton>
  );
};

export default ScrollToTopButton;
