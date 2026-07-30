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
    const popupTouchStartY = useRef(0);
    const overlayTouchStartY = useRef(0);

    useEffect(() => {
        const element = popupRef.current;
        const overlay = overlayRef.current;
        let isScrolling: boolean = false;

        if (!element) return;

        // Handle two types of scrolling
        const scrollContainer = element.getElementsByClassName('popup-scroll').item(0) ?? element;

        const handleTouchStart = (e: TouchEvent) => {
            popupTouchStartY.current = e.touches[0].clientY;
            element.style.transition = 'none';
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (e.changedTouches[0].clientY - popupTouchStartY.current > 200 && !isScrolling) {
                onClose();
            }
            element.style.transform = '';
            element.style.transition = '';
            element.classList.remove('dragging');
            isScrolling = false;
        };

        const handleTouchMovePopup = (e: TouchEvent) => {
            const delta = e.touches[0].clientY - popupTouchStartY.current;
            if (scrollContainer.scrollTop !== 0) {
                isScrolling = true;
            }
            if (!isScrolling && delta > 0) {
                e.preventDefault();
                element.classList.add('dragging');
                element.style.transform = `translateY(${delta}px)`;
            }
        };

        const handleOverlayTouchStart = (e: TouchEvent) => {
            overlayTouchStartY.current = e.touches[0].clientY;
            element.style.transition = 'none';
        };

        const handleOverlayTouchEnd = (e: TouchEvent) => {
            if (e.changedTouches[0].clientY - overlayTouchStartY.current > 50) {
                onClose();
            }
            element.style.transform = '';
            element.style.transition = '';
            element.classList.remove('dragging');
        };

        const handleOverlayTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const delta = e.touches[0].clientY - overlayTouchStartY.current;
            if (delta > 0) {
                element.classList.add('dragging');
                element.style.transform = `translateY(${delta}px)`;
            }
        };

        element?.addEventListener('touchstart', handleTouchStart);
        element?.addEventListener('touchend', handleTouchEnd);
        element?.addEventListener('touchmove', handleTouchMovePopup, { passive: false });

        overlay?.addEventListener('touchstart', handleOverlayTouchStart);
        overlay?.addEventListener('touchend', handleOverlayTouchEnd);
        overlay?.addEventListener('touchmove', handleOverlayTouchMove);

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchend', handleTouchEnd);
            element.removeEventListener('touchmove', handleTouchMovePopup);
            overlay?.removeEventListener('touchstart', handleOverlayTouchStart);
            overlay?.removeEventListener('touchend', handleOverlayTouchEnd);
            overlay?.removeEventListener('touchmove', handleOverlayTouchMove);
        };
    }, [show, onClose]);

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
