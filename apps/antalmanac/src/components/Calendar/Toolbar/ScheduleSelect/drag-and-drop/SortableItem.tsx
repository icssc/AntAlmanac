import type { DraggableSyntheticListeners, UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Box, ListItem } from '@mui/material';
import type { CSSProperties, PropsWithChildren } from 'react';
import { createContext, useContext, useMemo } from 'react';

interface Props {
    id: UniqueIdentifier;
}

interface Context {
    attributes: Record<string, any>;
    listeners: DraggableSyntheticListeners;
    ref(node: HTMLElement | null): void;
}

const SortableItemContext = createContext<Context>({
    attributes: {},
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

interface DragHandleProps {
    disabled?: boolean;
}

export function DragHandle({ disabled = false }: DragHandleProps) {
    const { attributes, listeners, ref } = useContext(SortableItemContext);

    return (
        <Box
            {...attributes}
            {...(disabled ? {} : listeners)}
            ref={ref}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled ? 'auto' : 'pointer',
                borderRadius: 1,
                '&:hover': {
                    backgroundColor: disabled ? 'transparent' : 'rgba(0, 0, 0, 0.1)',
                },
                '&:focus-visible': {
                    boxShadow: disabled ? 'none' : '0 0 0 2px #4c9ffe',
                },
            }}
        >
            <DragIndicatorIcon style={{ color: disabled ? 'gray' : 'white' }} />
        </Box>
    );
}
