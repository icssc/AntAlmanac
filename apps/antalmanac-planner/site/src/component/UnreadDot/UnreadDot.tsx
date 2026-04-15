import React from 'react';
import './UnreadDot.scss';

interface UnreadDotProps {
  show: boolean;
  displayFullNewText: boolean;
}

const UnreadDot: React.FC<UnreadDotProps> = ({ show, displayFullNewText }) => {
  if (!show) return null;

  return (
    <>
      {!displayFullNewText && <div className="spacing"></div>}
      <div className={`unread-${displayFullNewText ? 'pill' : 'circle'}`}>{displayFullNewText ? 'NEW' : null}</div>
    </>
  );
};

export default UnreadDot;
