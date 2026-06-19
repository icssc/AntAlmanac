import { forwardRef } from 'react';

type UIOverlayProps = JSX.IntrinsicElements['div'] & {
  zIndex: number;
};

const UIOverlay = forwardRef<HTMLDivElement, UIOverlayProps>(function UIOverlay(
  { zIndex, ...props }: UIOverlayProps,
  ref,
) {
  // Clicking this is only an alternative action to something that is already accessible
  return <div className="ui-overlay" {...props} ref={ref} style={{ zIndex }}></div>;
});

export default UIOverlay;
