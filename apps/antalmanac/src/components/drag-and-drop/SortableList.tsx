import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { Active, UniqueIdentifier } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { List, SxProps } from '@mui/material';
import { mergeSx } from '@mui/x-date-pickers/internals';
import type { ReactNode } from 'react';
import { Fragment, useMemo, useState } from 'react';

import { DragHandle } from '$components/drag-and-drop/DragHandle';
import { SortableItem } from '$components/drag-and-drop/SortableItem';
import { SortableOverlay } from '$components/drag-and-drop/SortableOverlay';

interface BaseItem {
    id: UniqueIdentifier;
}

interface Props<T extends BaseItem> {
    items: T[];
    onChange(items: T[], activeIndex?: number, overIndex?: number): void;
    renderItem(item: T): ReactNode;
    sx?: SxProps;
    disableHorizontalScroll?: boolean;
}

// ref: https://codesandbox.io/p/sandbox/dnd-kit-sortable-starter-template-22x1ix
export function SortableList<T extends BaseItem>({
    items,
    onChange,
    renderItem,
    sx,
    disableHorizontalScroll = true,
}: Props<T>) {
    const [active, setActive] = useState<Active | null>(null);
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
            }}
            onDragEnd={({ active, over }) => {
                if (over && active.id !== over?.id) {
                    const activeIndex = items.findIndex(({ id }) => id === active.id);
                    const overIndex = items.findIndex(({ id }) => id === over.id);
                    onChange(arrayMove(items, activeIndex, overIndex), activeIndex, overIndex);
                }
                setActive(null);
            }}
            onDragCancel={() => {
                setActive(null);
            }}
        >
            <SortableContext items={items}>
                <List sx={mergeSx({ padding: 0 }, sx)}>
                    {items.map((item) => (
                        <Fragment key={item.id}>{renderItem(item)}</Fragment>
                    ))}
                </List>
            </SortableContext>
            <SortableOverlay>{activeItem ? renderItem(activeItem) : null}</SortableOverlay>
        </DndContext>
    );
}

SortableList.Item = SortableItem;
SortableList.DragHandle = DragHandle;
