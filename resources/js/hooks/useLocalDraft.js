import { useState } from "react";

export function useLocalDraft(storageKey, initialData) {
    const [data, setData] = useState(initialData);

    const clearDraft = () => {
        // No-op for local storage since it's removed
    };

    return { data, setData, hasRestoredDraft: false, clearDraft };
}
