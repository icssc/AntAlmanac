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
import { Fragment, createContext, useMemo, useState } from 'react';

interface BaseItem {
    id: UniqueIdentifier;
}

interface SortableListProps<T extends BaseItem> {
    items: T[];
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
export function SortableList<T extends BaseItem>({
    items,
    onChange,
    renderItem,
    sx,
    disableHorizontalScroll = true,
    sortingStrategy,
}: SortableListProps<T>) {
    const [active, setActive] = useState<Active | null>(null);
    const [draggingItemState, setDraggingItemState] = useState<ContextType<typeof DraggingItemContext>>(null);

    const activeItem = useMemo(() => items.find((item) => item.id === active?.id), [active, items]);

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
                    const activeIndex = items.findIndex(({ id }) => id === active.id);
                    const overIndex = items.findIndex(({ id }) => id === over.id);
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
                <SortableContext items={items} strategy={sortingStrategy}>
                    <List sx={mergeSx({ padding: 0 }, sx)}>
                        {items.map((item, index) => (
                            <Fragment key={item.id}>{renderItem(item, index)}</Fragment>
                        ))}
                    </List>
                </SortableContext>
            </SortableListContext>
            <DraggingItemContext value={draggingItemState}>
                <SortableOverlay>
                    {activeItem
                        ? renderItem(
                              activeItem,
                              items.findIndex(({ id }) => id === activeItem.id)
                          )
                        : null}
                </SortableOverlay>
            </DraggingItemContext>
        </DndContext>
    );
}

SortableList.Item = SortableItem;
SortableList.DragHandle = DragHandle;
