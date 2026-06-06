import { DragHandle } from '$components/drag-and-drop/DragHandle';
import { SortableItem } from '$components/drag-and-drop/SortableItem';
import { SortableOverlay } from '$components/drag-and-drop/SortableOverlay';
import { mergeSx } from '$lib/helpers';
import { openSnackbar } from '$stores/SnackbarStore';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { Active, UniqueIdentifier } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, SortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { List, SxProps } from '@mui/material';
import type { ContextType, ReactNode } from 'react';
import { createContext, Fragment, useMemo, useState } from 'react';

interface SortableListProps<T> {
    items: T[];
    getItemId: (item: T) => UniqueIdentifier;
    onChange(items: T[], activeIndex?: number, overIndex?: number): void;
    renderItem(item: T, index: number): ReactNode;
    sx?: SxProps;
    disableHorizontalScroll?: boolean;
    sortingStrategy?: SortingStrategy;
}

export interface DraggingItemState {
    isCollapsed?: boolean;
}

interface SortableListContext {
    setDraggingItemState?: (state: DraggingItemState) => void;
}

export const SortableListContext = createContext<SortableListContext>({});

export const DraggingItemContext = createContext<DraggingItemState | null>(null);

// ref: https://codesandbox.io/p/sandbox/dnd-kit-sortable-starter-template-22x1ix
export function SortableList<T>({
    items,
    getItemId,
    onChange,
    renderItem,
    sx,
    disableHorizontalScroll = true,
    sortingStrategy,
}: SortableListProps<T>) {
    const [active, setActive] = useState<Active | null>(null);
    const [draggingItemState, setDraggingItemState] = useState<ContextType<typeof DraggingItemContext>>(null);

    const itemIds = useMemo(() => items.map(getItemId), [items, getItemId]);

    const activeItem = useMemo(() => items.find((item) => getItemId(item) === active?.id), [active, getItemId, items]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    return (
        <DndContext
            sensors={sensors}
            modifiers={[restrictToVerticalAxis]}
            autoScroll={{ threshold: { x: disableHorizontalScroll ? 0 : 0.2, y: 0.2 } }}
            onDragStart={({ active }) => {
                setActive(active);
                document.body.style.cursor = 'grabbing';
            }}
            onDragEnd={({ active, over }) => {
                if (over && active.id !== over?.id) {
                    const activeIndex = items.findIndex((item) => getItemId(item) === active.id);
                    const overIndex = items.findIndex((item) => getItemId(item) === over.id);
                    if (activeIndex !== -1 && overIndex !== -1) {
                        onChange(arrayMove(items, activeIndex, overIndex), activeIndex, overIndex);
                    } else {
                        openSnackbar('error', 'Failed to reorder list');
                    }
                }
                setActive(null);
                document.body.style.cursor = '';
            }}
            onDragCancel={() => {
                setActive(null);
                document.body.style.cursor = '';
            }}
        >
            <SortableListContext value={{ setDraggingItemState }}>
                <SortableContext items={itemIds} strategy={sortingStrategy}>
                    <List sx={mergeSx({ padding: 0 }, sx)}>
                        {items.map((item, index) => (
                            <Fragment key={getItemId(item)}>{renderItem(item, index)}</Fragment>
                        ))}
                    </List>
                </SortableContext>
            </SortableListContext>
            <DraggingItemContext value={draggingItemState}>
                <SortableOverlay>
                    {activeItem
                        ? renderItem(
                              activeItem,
                              items.findIndex((item) => getItemId(item) === getItemId(activeItem))
                          )
                        : null}
                </SortableOverlay>
            </DraggingItemContext>
        </DndContext>
    );
}

SortableList.Item = SortableItem;
SortableList.DragHandle = DragHandle;
