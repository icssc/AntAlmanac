import type { DraggableAttributes, DraggableSyntheticListeners, UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ListItem } from '@mui/material';
import type { CSSProperties, PropsWithChildren } from 'react';
import { createContext, useMemo } from 'react';

interface Props {
    id: UniqueIdentifier;
}

interface Context {
    attributes: DraggableAttributes | null;
    listeners: DraggableSyntheticListeners;
    ref(node: HTMLElement | null): void;
}

export const SortableItemContext = createContext<Context>({
    attributes: null,
    listeners: undefined,
    ref: (_node: HTMLElement | null) => {
        // Intentionally left blank
    },
});

export function SortableItem({ children, id }: PropsWithChildren<Props>) {
    const { attributes, isDragging, listeners, setNodeRef, setActivatorNodeRef, transform } = useSortable({
        id,
    });
    const context = useMemo(
        () => ({
            attributes,
            listeners,
            ref: setActivatorNodeRef,
        }),
        [attributes, listeners, setActivatorNodeRef]
    );
    const style: CSSProperties = {
        opacity: isDragging ? 0.4 : undefined,
        transform: CSS.Translate.toString(transform),
        padding: 0,
    };

    return (
        <SortableItemContext.Provider value={context}>
            <ListItem ref={setNodeRef} style={style}>
                {children}
            </ListItem>
        </SortableItemContext.Provider>
    );
}
