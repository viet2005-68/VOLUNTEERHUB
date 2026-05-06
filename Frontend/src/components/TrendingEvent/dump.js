export const trendingEventsData = [
  {
    id: "evt_001",
    title: "Marine Education Workshop",
    category: "Education",
    isTrending: true, // Dùng để hiển thị icon ngọn lửa
    trendPercentage: 156, // Dùng cho badge +156%
    stats: {
      members: {
        current: 5,
        capacity: 15,
      },
      newPosts: 12,
      likes: 78,
      comments: 34,
    },
    actions: {
      viewLink: "/events/marine-workshop",
      channelLink: "/channels/marine-edu",
    },
  },
  // Dữ liệu mẫu thêm để test list
  {
    id: "evt_002",
    title: "Community Garden Project",
    category: "Environment",
    isTrending: true,
    trendPercentage: 8555,
    stats: {
      members: {
        current: 40,
        capacity: 50,
      },
      newPosts: 5,
      likes: 120,
      comments: 45,
    },
    actions: {
      viewLink: "/events/garden-project",
      channelLink: "/channels/green-life",
    },
  },
  {
    id: "evt_003",
    title: "ReactJS Advanced Class",
    category: "Technology",
    isTrending: false, // Trường hợp không trending
    trendPercentage: 12,
    stats: {
      members: {
        current: 90,
        capacity: 100,
      },
      newPosts: 0, // Không có bài mới
      likes: 230,
      comments: 89,
    },
    actions: {
      viewLink: "/events/react-adv",
      channelLink: "/channels/tech-hub",
    },
  },
];
