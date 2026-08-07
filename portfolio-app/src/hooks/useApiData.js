import { useEffect, useRef, useState } from 'react';
import { fetchApi } from '../utils/apiClient.js';

export function useApiData({ path, fallbackData, transform = (data) => data }) {
    const [data, setData] = useState(fallbackData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const transformRef = useRef(transform);
    const fallbackRef = useRef(fallbackData);

    transformRef.current = transform;
    fallbackRef.current = fallbackData;

    useEffect(() => {
        let mounted = true;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                const result = await fetchApi(path);
                const transformed = transformRef.current(result);
                if (mounted) {
                    const hasData = Array.isArray(transformed)
                        ? transformed.length > 0
                        : transformed && Object.keys(transformed).length > 0;
                    setData(hasData ? transformed : fallbackRef.current);
                }
            } catch (err) {
                if (mounted) {
                    setError(err.message || 'Unable to load data');
                    setData(fallbackRef.current);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, [path]);

    // Initialize fallback data once on mount. Avoid re-applying when
    // callers provide new object identities each render (common with
    // inline object literals) which can cause render loops.
    useEffect(() => {
        setData(fallbackRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { data, loading, error };
}
