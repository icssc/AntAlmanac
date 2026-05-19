import { DragOverlay } from '@dnd-kit/core';
import type { DropAnimation } from '@dnd-kit/core';

const dropAnimationConfig: DropAnimation = {
    duration: 500,
    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
};

export function SortableOverlay({ children }: { children: React.ReactNode }) {
    return <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>;
}
