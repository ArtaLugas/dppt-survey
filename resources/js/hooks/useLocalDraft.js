import { useState, useEffect, useRef, use } from "react";

export function useLocalDraft(storageKey, initialData) {
    const [data, setData] = useState(() => {
        if (typeof window === 'undefined') return initialData;
        try {
            const savedData = window.localStorage.getItem(storageKey);
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (error) {
            console.warn('Erroor reading local storage:', error);
        }
        return initialData;

    });

    const [hasRestoredDraft, setHasRestoreDraft] = useState(false);
    const isFirstRender = useRef(true);

    useEffect(() => {
        const savedData = window.localStorage.getItem(storageKey);
        if (savedData && savedData !== JSON.stringify(initialData)) {
            setHasRestoreDraft(true);
        }
    }, [storageKey, initialData]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeoutId = setTimeout(() => {
            try {
                const textDataOnly = { ...data };
                delete textDataOnly.photos;
                delete textDataOnly.ktp_files;

                window.localStorage.setItem(storageKey, JSON.stringify(textDataOnly));

            } catch (error) {
                console.warn('Gagal melakukan auto-save ke Local Storage', error);
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [data, storageKey]);

    const clearDraft = () => {
        try {
            window.localStorage.removeItem(storageKey);
            setHasRestoreDraft(false);
        } catch (error) {
            console.warn('Error clearnig localStorage', error);
        }
    };

    return { data, setData, hasRestoredDraft, clearDraft };
}
