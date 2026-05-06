import { CONFIG } from "../constant/config";

export const api = {
    async get(path) {
        const res = await fetch(`${CONFIG.API_URL}${path}`);
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
    },

    async post(path, body) {
        const res = await fetch(`${CONFIG.API_URL}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
    },

    async put(path, body) {
        const res = await fetch(`${CONFIG.API_URL}${path}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
    },

    async del(path) {
        const res = await fetch(`${CONFIG.API_URL}${path}`, { method: "DELETE" });
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
    }
};