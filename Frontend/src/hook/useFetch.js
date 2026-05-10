import { useState, useEffect } from "react";


// sẽ cố gắng thêm axios nếu cần bảo mật, log . cấu hình lại base url sau
export const useFetch = (url, option = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(url, option);
                if (!res.ok) throw new Error(`HTTP ERROR: ${res.status}`);
                const json = await res.json();
                setData(json);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [url]);
    return { data, loading, error };
}