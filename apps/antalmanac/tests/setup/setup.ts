import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
    cleanup();
});

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

vi.mock('$lib/auth/auth', () => {
    return {
        // This module can only run on the server
    };
});

vi.mock('$lib/auth/authActions', () => {
    return {
        // This module can only run on the server
    };
});

function createTrpcMock(): object {
    const handler: ProxyHandler<object> = {
        get(_target, prop) {
            if (prop === 'query' || prop === 'mutate') {
                return vi.fn().mockResolvedValue(undefined);
            }
            if (prop === 'useQuery' || prop === 'useMutation' || prop === 'useInfiniteQuery') {
                return vi.fn(() => ({
                    data: undefined,
                    isLoading: false,
                    isError: false,
                    error: null,
                    refetch: vi.fn(),
                    mutate: vi.fn(),
                }));
            }
            if (prop === 'Provider') {
                return ({ children }: { children: unknown }) => children;
            }
            if (prop === 'createClient') {
                return vi.fn(() => createTrpcMock());
            }
            if (prop === 'then') {
                return undefined;
            }
            return new Proxy({}, handler);
        },
    };
    return new Proxy({}, handler);
}

vi.mock('$lib/api/trpc', () => ({
    trpc: createTrpcMock(),
    trpcReact: createTrpcMock(),
    trpcConfig: { links: [] },
}));
