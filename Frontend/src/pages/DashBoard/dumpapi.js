// mockApi.js — mô phỏng backend API
export async function mockApiFetch(path, { page = 1, pageSize = 4 } = {}) {
    console.log("Fetching:", path, "page:", page, "pageSize:", pageSize);
    await new Promise((r) => setTimeout(r, 300)); // fake network delay

    const expandToTen = (base, tabPrefix = '') => {
        const out = [...base];
        const need = 10 - out.length;
        for (let i = 0; i < need; i++) {
            const src = base[i % base.length];
            out.push({
                ...src,
                id: `${tabPrefix}-${(src.id || 0) + 100 + i}`,
                title: `${src.title} #${i + 1}`,
            });
        }
        return out;
    };

    if (path.includes("/applied")) {
        const base = [
            {
                id: 1515,
                title: "Community Cleanup Drive",
                organization: "GreenFuture Org",
                date: "Nov 12, 2025 • 08:00 AM - 11:00 AM",
                location: "District 3 Park",
                status: "Pending",
                statusVariant: "dark",
                notes: "Bring gloves and water bottle.",
            },
            {
                id: 5418,
                title: "Tree Planting Event",
                organization: "Urban Earth Foundation",
                date: "Nov 15, 2025 • 09:00 AM - 12:00 PM",
                location: "City Arboretum",
                status: "Pending",
                statusVariant: "light",
                notes: "Waiting for slot confirmation.",
            },
            {
                id: 3515,
                title: "Tree Planting Event",
                organization: "Urban Earth Foundation",
                date: "Nov 15, 2025 • 09:00 AM - 12:00 PM",
                location: "City Arboretum",
                status: "Pending",
                statusVariant: "light",
                notes: "Waiting for slot confirmation.",
            },
        ];
        const all = expandToTen(base, 'applied');
        const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
        const start = (page - 1) * pageSize;
        const items = all.slice(start, start + pageSize);
        return { items, totalPages };
    }

    if (path.includes("/upcoming")) {
        const base = [
            {
                id: 3455,
                title: "Tech Workshop for Youth",
                organization: "Code4Good",
                date: "Dec 5, 2025 • 10:00 AM - 02:00 PM",
                location: "Youth Innovation Hub",
                status: "Approved",
                statusVariant: "dark",
            },
            {
                id: 4545,
                title: "Animal Shelter Volunteering",
                organization: "PawPal Foundation",
                date: "Dec 12, 2025 • 09:00 AM - 01:00 PM",
                location: "PawPal Animal Shelter",
                status: "Pending",
                statusVariant: "light",
            },
        ];
        const all = expandToTen(base, 'upcoming');
        const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
        const start = (page - 1) * pageSize;
        const items = all.slice(start, start + pageSize);
        return { items, totalPages };
    }

    if (path.includes("/completed")) {
        const base = [
            {
                id: 555,
                title: "Food Drive Distribution",
                organization: "HopeHands",
                date: "Oct 20, 2025",
                hours: "5 hours contributed",
                status: "Verified",
                statusVariant: "accent",
            },
            {
                id: 65,
                title: "Senior Care Center Visit",
                organization: "GoldenAge",
                date: "Oct 10, 2025",
                hours: "3 hours contributed",
                status: "Pending Verification",
                statusVariant: "light",
            },
        ];
        const all = expandToTen(base, 'completed');
        const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
        const start = (page - 1) * pageSize;
        const items = all.slice(start, start + pageSize);
        return { items, totalPages };
    }

    throw new Error("Unknown endpoint: " + path);
}
