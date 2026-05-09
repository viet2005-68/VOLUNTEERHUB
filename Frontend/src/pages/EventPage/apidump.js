// Mock API dump for Event Page - Demo data only
// Chỉ phục vụ cho EventLayout.jsx

const dumpData = {
    id: 1,
    title: "Test event yeah",
    description: "testing event descritpiont",
    imageUrl: "https://www.greatplacetowork.com/images/blog-images/articles/American-Express-Employees-Volunteer.webp",
    category: "Combat",
    location: "Nguyen Trai, Thanh Xuan, Ha Noi",
    date: "2025-11-09T04:17:21.034",
    startTime: "2025-11-09T04:17:21.034",
    endTime: "2025-11-09T04:17:21.034",
    capacity: 100,
    registered: 88,
    availableSlots: 12,
    ownerName: "Ocean Care Foundation",
    status: "APPROVED",
    duration: "4 hours",
    minAge: 16,
    registrationDeadline: "2025-09-13T23:59:59.000Z",
    registrationStatus: "Closed",
    durationCancel: "24 hours"
};

// Danh sách events cho demo
const eventsList = [
    dumpData,
    {
        id: 2,
        title: "Chiến dịch trồng 1000 cây xanh",
        description: `About This Event
Join us for a morning of cleaning up Sunset Beach and protecting our marine ecosystem.We'll provide all necessary equipment including gloves, trash bags, and grabbers. This is a great opportunity to make a direct environmental impact while enjoying the beautiful coastline.

Help us keep our beaches clean and protect marine wildlife! This beach cleanup event is part of our ongoing effort to preserve the natural beauty of our coastline and ensure a healthy environment for both marine life and beachgoers.

What we'll be doing:
• Removing plastic debris, bottles, and other litter from the beach and nearby areas
• Sorting collected materials for proper recycling and disposal
• Recording data about the types and amounts of debris collected for environmental research
• Educating visitors about marine conservation

What's provided:
• All cleanup equipment(gloves, grabbers, trash bags)
• Safety briefing and orientation
• Refreshments and snacks during break time
• Educational materials about marine conservation
• Certificate of participation for volunteer hours

Impact: Last year, our beach cleanup events removed over 2, 500 pounds of debris from local beaches and engaged more than 500 volunteers in hands - on environmental action.`,
        imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
        category: "Trồng cây",
        location: "Công viên Thống Nhất, Hà Nội",
        date: "2025-10-20T08:00:00.000Z",
        startTime: "2025-10-20T08:00:00.000Z",
        endTime: "2025-10-20T12:00:00.000Z",
        capacity: 100,
        registered: 88,
        availableSlots: 12,
        ownerName: "Green Future",
        status: "APPROVED",
        duration: "4 hours",
        minAge: 18,
        registrationDeadline: "2025-10-15T23:59:59.000Z",
        registrationStatus: "Open",
        durationCancel: "48 hours"
    }
];

// Simple API helper - chỉ GET event by ID
export const api = {
    async get(path) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Parse /events/:id
        const match = path.match(/^\/events\/(\d+)$/);
        if (match) {
            const id = Number(match[1]);
            const event = eventsList.find(e => e.id === id);
            if (event) return event;
            throw new Error(`Event ${id} not found`);
        }

        // GET /events -> return all
        if (path === "/events") {
            return eventsList;
        }

        throw new Error(`Path ${path} not found`);
    }
};


