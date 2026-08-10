import { SortableItemContext } from '$components/drag-and-drop/SortableItem';
import {
    DraggingItemContext,
    type DraggingItemState,
    SortableListContext,
} from '$components/drag-and-drop/SortableList';
import { useContext, useEffect } from 'react';

/**
 * Returns state that is valid when this component is being rendered as a `SortableOverlay`.
 *
 * @param getDraggingItemState Callback to set state when this component,
 * which is part of the actual list and not `SortableOverlay`, is dragged.
 */
export const useDraggingItemState = (getDraggingItemState: () => DraggingItemState) => {
    const { isDragging } = useContext(SortableItemContext);
    const { setDraggingItemState } = useContext(SortableListContext);
    const state = useContext(DraggingItemContext);

    useEffect(() => {
        if (setDraggingItemState && isDragging) {
            setDraggingItemState(getDraggingItemState());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- getDraggingItemState is stable
    }, [isDragging, setDraggingItemState]);

    return state;
};
