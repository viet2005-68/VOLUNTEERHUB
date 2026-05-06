// Mock data for Registration Manager
const ALL_REGISTRATIONS = [
    {
        id: "reg_001",
        name: "Alex Chen",
        email: "alex@email.com",
        avatar: "https://i.pravatar.cc/150?img=10",
        eventId: "event_beach_cleanup",
        eventName: "Beach Cleanup Drive",
        registrationDate: "2025-08-20",
        skills: ["Environmental Care", "Team Work"],
        message: "I'm passionate about ocean conservation and would love to help!",
        status: "pending",
    },
    {
        id: "reg_002",
        name: "Maria Rodriguez",
        email: "maria@email.com",
        avatar: "https://i.pravatar.cc/150?img=32",
        eventId: "event_marine_workshop",
        eventName: "Marine Education Workshop",
        registrationDate: "2025-08-21",
        skills: ["Teaching", "Communication"],
        message: "Excited to help educate others about marine life!",
        status: "pending",
    },
    {
        id: "reg_003",
        name: "John Walker",
        email: "john@email.com",
        avatar: "https://i.pravatar.cc/150?img=5",
        eventId: "event_tree_planting",
        eventName: "Tree Planting Festival",
        registrationDate: "2025-08-15",
        skills: ["Gardening", "Physical Work"],
        message: "Happy to support environmental protection activities.",
        status: "approved",
    },
    {
        id: "reg_004",
        name: "Sofia Nguyen",
        email: "sofia@email.com",
        avatar: "https://i.pravatar.cc/150?img=45",
        eventId: "event_beach_cleanup",
        eventName: "Beach Cleanup Drive",
        registrationDate: "2025-08-22",
        skills: ["Leadership", "First Aid"],
        message: "I have experience organizing cleanups and helping teams.",
        status: "rejected",
    },
    {
        id: "reg_005",
        name: "David Kim",
        email: "david@email.com",
        avatar: "https://i.pravatar.cc/150?img=20",
        eventId: "event_marine_workshop",
        eventName: "Marine Education Workshop",
        registrationDate: "2025-08-19",
        skills: ["Photography", "Public Speaking"],
        message: "Would love to document and present marine life stories.",
        status: "approved",
    },
    {
        id: "reg_006",
        name: "Emma Johnson",
        email: "emma@email.com",
        avatar: "https://i.pravatar.cc/150?img=15",
        eventId: "event_tree_planting",
        eventName: "Tree Planting Festival",
        registrationDate: "2025-08-17",
        skills: ["Team Work"],
        message: "Happy to help wherever I can!",
        status: "pending",
    },
    {
        id: "reg_007",
        name: "Liam Brown",
        email: "liam@email.com",
        avatar: "https://i.pravatar.cc/150?img=8",
        eventId: "event_beach_cleanup",
        eventName: "Beach Cleanup Drive",
        registrationDate: "2025-08-18",
        skills: ["Environmental Care"],
        message: "I live near the beach and want to contribute.",
        status: "approved",
    },
    {
        id: "reg_008",
        name: "Hannah Davis",
        email: "hannah@email.com",
        avatar: "https://i.pravatar.cc/150?img=27",
        eventId: "event_marine_workshop",
        eventName: "Marine Education Workshop",
        registrationDate: "2025-08-23",
        skills: ["Teaching", "Art"],
        message: "I want to teach kids about the ocean using creative activities.",
        status: "pending",
    },
    {
        id: "reg_009",
        name: "James Wilson",
        email: "james@email.com",
        avatar: "https://i.pravatar.cc/150?img=12",
        eventId: "event_beach_cleanup",
        eventName: "Beach Cleanup Drive",
        registrationDate: "2025-08-24",
        skills: ["Leadership", "Environmental Care"],
        message: "Ready to lead a team for beach cleanup!",
        status: "pending",
    },
    {
        id: "reg_010",
        name: "Olivia Martinez",
        email: "olivia@email.com",
        avatar: "https://i.pravatar.cc/150?img=38",
        eventId: "event_tree_planting",
        eventName: "Tree Planting Festival",
        registrationDate: "2025-08-25",
        skills: ["Gardening", "Photography"],
        message: "I'd love to help plant trees and document the event.",
        status: "approved",
    },
    {
        id: "reg_011",
        name: "William Anderson",
        email: "william@email.com",
        avatar: "https://i.pravatar.cc/150?img=18",
        eventId: "event_marine_workshop",
        eventName: "Marine Education Workshop",
        registrationDate: "2025-08-26",
        skills: ["Teaching", "Research"],
        message: "Marine biologist here, happy to share knowledge!",
        status: "pending",
    },
    {
        id: "reg_012",
        name: "Ava Thompson",
        email: "ava@email.com",
        avatar: "https://i.pravatar.cc/150?img=42",
        eventId: "event_beach_cleanup",
        eventName: "Beach Cleanup Drive",
        registrationDate: "2025-08-27",
        skills: ["Team Work", "First Aid"],
        message: "Certified first aider, can help with safety.",
        status: "approved",
    },
    {
        id: "reg_013",
        name: "Benjamin Lee",
        email: "ben@email.com",
        avatar: "https://i.pravatar.cc/150?img=22",
        eventId: "event_tree_planting",
        eventName: "Tree Planting Festival",
        registrationDate: "2025-08-28",
        skills: ["Physical Work", "Driving"],
        message: "I have a truck and can help transport supplies.",
        status: "rejected",
    },
    {
        id: "reg_014",
        name: "Isabella Garcia",
        email: "isabella@email.com",
        avatar: "https://i.pravatar.cc/150?img=48",
        eventId: "event_marine_workshop",
        eventName: "Marine Education Workshop",
        registrationDate: "2025-08-29",
        skills: ["Art", "Communication"],
        message: "I can create educational materials for kids.",
        status: "pending",
    },
    {
        id: "reg_015",
        name: "Mason Taylor",
        email: "mason@email.com",
        avatar: "https://i.pravatar.cc/150?img=25",
        eventId: "event_beach_cleanup",
        eventName: "Beach Cleanup Drive",
        registrationDate: "2025-08-30",
        skills: ["Environmental Care", "Leadership"],
        message: "Environmental science student, eager to help!",
        status: "approved",
    },
    {
        id: "reg_016",
        name: "Charlotte White",
        email: "charlotte@email.com",
        avatar: "https://i.pravatar.cc/150?img=35",
        eventId: "event_tree_planting",
        eventName: "Tree Planting Festival",
        registrationDate: "2025-08-31",
        skills: ["Gardening", "Team Work"],
        message: "Love gardening and want to give back to nature.",
        status: "pending",
    },
];

// Paginated API function
export const mockRegistrationData = async ({
    page = 1,
    pageSize = 6,
    search = "",
    status = "pending",
    event = "all",
} = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Filter by search, status, and event
    let filtered = ALL_REGISTRATIONS.filter((reg) => {
        const matchesSearch =
            reg.name.toLowerCase().includes(search.toLowerCase()) ||
            reg.email.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = reg.status === status;
        const matchesEvent = event === "all" || reg.eventId === event;
        return matchesSearch && matchesStatus && matchesEvent;
    });

    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return {
        items,
        totalItems,
        totalPages,
        currentPage: page,
    };
};

// Status constants
export const REGISTRATION_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
};

export const STATUS_CONFIG = {
    [REGISTRATION_STATUS.PENDING]: {
        label: "Pending",
        color: "bg-yellow-100 text-yellow-700",
    },
    [REGISTRATION_STATUS.APPROVED]: {
        label: "Approved",
        color: "bg-green-100 text-green-700",
    },
    [REGISTRATION_STATUS.REJECTED]: {
        label: "Rejected",
        color: "bg-red-100 text-red-700",
    },
};
