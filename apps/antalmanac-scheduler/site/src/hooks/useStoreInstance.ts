import { useState } from 'react';

export function useStoreInstance<T>(createStore: () => T) {
    const [store] = useState(createStore);
    return store;
}
