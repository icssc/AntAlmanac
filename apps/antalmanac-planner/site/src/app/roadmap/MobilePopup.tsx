'use client';
import './MobilePopup.scss';
import { FC, PropsWithChildren, useEffect, useRef } from 'react';
import UIOverlay from '../../component/UIOverlay/UIOverlay';
import { useIsMobile } from '../../helpers/util';
import { CSSTransition } from 'react-transition-group';

interface MobilePopupProps extends PropsWithChildren {
  show: boolean;
  onClose: () => void;
  className?: string;
  id?: string;
}

const MobilePopup: FC<MobilePopupProps> = ({ show, onClose, className, id, children }) => {
  const isMobile = useIsMobile();
  const overlayRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobile) return;
    overlayRef.current?.classList.toggle('enter-done', show);
    popupRef.current?.classList.toggle('enter-done', show);
  }, [isMobile, show]);

  if (!isMobile) return null;

  return (
    <>
      {isMobile && <UIOverlay onClick={onClose} zIndex={399} ref={overlayRef} />}
      <CSSTransition in={show} timeout={500} unmountOnExit nodeRef={popupRef}>
        <div className={`mobile-popup mobile ${className ?? ''}`} id={id ?? ''} ref={popupRef}>
          {children}
        </div>
      </CSSTransition>
    </>
  );
};

export default MobilePopup;
