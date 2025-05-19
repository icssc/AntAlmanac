import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { Active, UniqueIdentifier } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { List } from '@mui/material';
import type { ReactNode } from 'react';
import { Fragment, useMemo, useState } from 'react';

import { DragHandle } from '$components/Calendar/Toolbar/ScheduleSelect/drag-and-drop/DragHandle';
import { SortableItem } from '$components/Calendar/Toolbar/ScheduleSelect/drag-and-drop/SortableItem';
import { SortableOverlay } from '$components/Calendar/Toolbar/ScheduleSelect/drag-and-drop/SortableOverlay';
import AppStore from '$stores/AppStore';

interface BaseItem {
    id: UniqueIdentifier;
}

interface Props<T extends BaseItem> {
    items: T[];
    onChange(items: T[]): void;
    renderItem(item: T): ReactNode;
}

// ref: https://codesandbox.io/p/sandbox/dnd-kit-sortable-starter-template-22x1ix
export function SortableList<T extends BaseItem>({ items, onChange, renderItem }: Props<T>) {
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
            onDragStart={({ active }) => {
                setActive(active);
            }}
            onDragEnd={({ active, over }) => {
                if (over && active.id !== over?.id) {
                    const activeIndex = items.findIndex(({ id }) => id === active.id);
                    const overIndex = items.findIndex(({ id }) => id === over.id);
                    onChange(arrayMove(items, activeIndex, overIndex));
                    AppStore.reorderSchedule(activeIndex, overIndex);
                }
                setActive(null);
            }}
            onDragCancel={() => {
                setActive(null);
            }}
        >
            <SortableContext items={items}>
                <List sx={{ padding: 0 }}>
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
