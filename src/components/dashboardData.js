// src/data/dashboardData.js

// Dashboard cards data
export const dashboardCards = [
  {
    id: "bookings",
    title: "Bookings",
    value: "145",
    icon: "Calendar",
    color: "bg-primary",
    trend: "+12%",
    trendUp: true,
  },
  {
    id: "rooms",
    title: "Rooms Available",
    value: "42",
    icon: "Home",
    color: "bg-primary",
    trend: "-5%",
    trendUp: false,
  },
  {
    id: "revenue",
    title: "Revenue",
    value: "₹32,450",
    icon: "FaIndianRupeeSign",
    color: "bg-primary",
    trend: "+8%",
    trendUp: true,
  },
  {
    id: "occupancy",
    title: "Occupancy Rate",
    value: "78%",
    icon: "Percent",
    color: "bg-primary",
    trend: "+3%",
    trendUp: true,
  },
  {
    id: "guests",
    title: "Active Guests",
    value: "58",
    icon: "Users",
    color: "bg-primary",
    trend: "+5%",
    trendUp: true,
  },
  {
    id: "rating",
    title: "Avg. Rating",
    value: "4.8",
    icon: "Star",
    color: "bg-primary",
    trend: "+0.2",
    trendUp: true,
  },
];

// Revenue data
export const revenueData = {
  weekly: [
    { name: "Mon", value: 12400 },
    { name: "Tue", value: 14800 },
    { name: "Wed", value: 15200 },
    { name: "Thu", value: 16800 },
    { name: "Fri", value: 19500 },
    { name: "Sat", value: 21000 },
    { name: "Sun", value: 18500 },
  ],
  monthly: [
    { name: "Week 1", value: 85000 },
    { name: "Week 2", value: 92000 },
    { name: "Week 3", value: 98000 },
    { name: "Week 4", value: 105000 },
  ],
  yearly: [
    // 2023 data
    { name: "Jan", value: 65000, year: 2023 },
    { name: "Feb", value: 59000, year: 2023 },
    { name: "Mar", value: 80000, year: 2023 },
    { name: "Apr", value: 81000, year: 2023 },
    { name: "May", value: 90000, year: 2023 },
    { name: "Jun", value: 125000, year: 2023 },
    { name: "Jul", value: 130000, year: 2023 },
    { name: "Aug", value: 120000, year: 2023 },
    { name: "Sep", value: 110000, year: 2023 },
    { name: "Oct", value: 105000, year: 2023 },
    { name: "Nov", value: 95000, year: 2023 },
    { name: "Dec", value: 115000, year: 2023 },

    // 2024 data
    { name: "Jan", value: 75000, year: 2024 },
    { name: "Feb", value: 69000, year: 2024 },
    { name: "Mar", value: 90000, year: 2024 },
    { name: "Apr", value: 91000, year: 2024 },
    { name: "May", value: 100000, year: 2024 },
    { name: "Jun", value: 135000, year: 2024 },
    { name: "Jul", value: 140000, year: 2024 },
    { name: "Aug", value: 130000, year: 2024 },
    { name: "Sep", value: 120000, year: 2024 },
    { name: "Oct", value: 115000, year: 2024 },
    { name: "Nov", value: 105000, year: 2024 },
    { name: "Dec", value: 125000, year: 2024 },

    // 2025 data
    { name: "Jan", value: 85000, year: 2025 },
    { name: "Feb", value: 79000, year: 2025 },
    { name: "Mar", value: 100000, year: 2025 },
    { name: "Apr", value: 101000, year: 2025 },
    { name: "May", value: 110000, year: 2025 },
    { name: "Jun", value: 145000, year: 2025 },
    { name: "Jul", value: 150000, year: 2025 },
    { name: "Aug", value: 140000, year: 2025 },
    { name: "Sep", value: 130000, year: 2025 },
    { name: "Oct", value: 125000, year: 2025 },
    { name: "Nov", value: 115000, year: 2025 },
    { name: "Dec", value: 135000, year: 2025 },
  ],
};

// Occupancy data
export const occupancyData = {
  weekly: [
    { name: "Mon", value: 65 },
    { name: "Tue", value: 70 },
    { name: "Wed", value: 75 },
    { name: "Thu", value: 80 },
    { name: "Fri", value: 90 },
    { name: "Sat", value: 95 },
    { name: "Sun", value: 85 },
  ],
  monthly: [
    { name: "Week 1", value: 72 },
    { name: "Week 2", value: 78 },
    { name: "Week 3", value: 82 },
    { name: "Week 4", value: 88 },
  ],
  yearly: [
    // 2023 data
    { name: "Jan", value: 68, year: 2023 },
    { name: "Feb", value: 72, year: 2023 },
    { name: "Mar", value: 75, year: 2023 },
    { name: "Apr", value: 78, year: 2023 },
    { name: "May", value: 82, year: 2023 },
    { name: "Jun", value: 88, year: 2023 },
    { name: "Jul", value: 92, year: 2023 },
    { name: "Aug", value: 95, year: 2023 },
    { name: "Sep", value: 90, year: 2023 },
    { name: "Oct", value: 85, year: 2023 },
    { name: "Nov", value: 80, year: 2023 },
    { name: "Dec", value: 75, year: 2023 },

    // 2024 data
    { name: "Jan", value: 70, year: 2024 },
    { name: "Feb", value: 74, year: 2024 },
    { name: "Mar", value: 77, year: 2024 },
    { name: "Apr", value: 80, year: 2024 },
    { name: "May", value: 84, year: 2024 },
    { name: "Jun", value: 90, year: 2024 },
    { name: "Jul", value: 94, year: 2024 },
    { name: "Aug", value: 97, year: 2024 },
    { name: "Sep", value: 92, year: 2024 },
    { name: "Oct", value: 87, year: 2024 },
    { name: "Nov", value: 82, year: 2024 },
    { name: "Dec", value: 77, year: 2024 },

    // 2025 data
    { name: "Jan", value: 72, year: 2025 },
    { name: "Feb", value: 76, year: 2025 },
    { name: "Mar", value: 79, year: 2025 },
    { name: "Apr", value: 82, year: 2025 },
    { name: "May", value: 86, year: 2025 },
    { name: "Jun", value: 92, year: 2025 },
    { name: "Jul", value: 96, year: 2025 },
    { name: "Aug", value: 99, year: 2025 },
    { name: "Sep", value: 94, year: 2025 },
    { name: "Oct", value: 89, year: 2025 },
    { name: "Nov", value: 84, year: 2025 },
    { name: "Dec", value: 79, year: 2025 },
  ],
};

// Booking source data
export const bookingSourceData = {
  weekly: [
    { name: "Direct", value: 40 },
    { name: "Booking.com", value: 30 },
    { name: "Expedia", value: 20 },
    { name: "Others", value: 10 },
  ],
  monthly: [
    { name: "Direct", value: 45 },
    { name: "Booking.com", value: 25 },
    { name: "Expedia", value: 15 },
    { name: "Others", value: 15 },
  ],
  yearly: {
    2023: [
      { name: "Direct", value: 30 },
      { name: "Booking.com", value: 40 },
      { name: "Expedia", value: 20 },
      { name: "Others", value: 10 },
    ],
    2024: [
      { name: "Direct", value: 35 },
      { name: "Booking.com", value: 35 },
      { name: "Expedia", value: 20 },
      { name: "Others", value: 10 },
    ],
    2025: [
      { name: "Direct", value: 40 },
      { name: "Booking.com", value: 30 },
      { name: "Expedia", value: 20 },
      { name: "Others", value: 10 },
    ],
  },
};

// Room type data
export const roomTypeData = {
  weekly: [
    { name: "Standard", value: 25 },
    { name: "Deluxe", value: 35 },
    { name: "Suite", value: 20 },
    { name: "Executive", value: 20 },
  ],
  monthly: [
    { name: "Standard", value: 28 },
    { name: "Deluxe", value: 32 },
    { name: "Suite", value: 22 },
    { name: "Executive", value: 18 },
  ],
  yearly: {
    2023: [
      { name: "Standard", value: 30 },
      { name: "Deluxe", value: 30 },
      { name: "Suite", value: 25 },
      { name: "Executive", value: 15 },
    ],
    2024: [
      { name: "Standard", value: 28 },
      { name: "Deluxe", value: 32 },
      { name: "Suite", value: 24 },
      { name: "Executive", value: 16 },
    ],
    2025: [
      { name: "Standard", value: 25 },
      { name: "Deluxe", value: 35 },
      { name: "Suite", value: 22 },
      { name: "Executive", value: 18 },
    ],
  },
};

export const COLORS = ["#e11d48", "#d97706", "#0891b2", "#4f46e5"];

// Add this to your dashboardData.js file

// Task data
export const departments = [
  { id: "housekeeping", name: "Housekeeping", action: "Clean" },
  { id: "laundry", name: "Laundry", action: "Wash" },
  { id: "maintenance", name: "Maintenance", action: "Repair" },
  { id: "roomservice", name: "Room Service", action: "Serve" },
  { id: "reception", name: "Reception", action: "Greet" },
];

export const staffMembers = {
  Housekeeping: ["John Doe", "Mary Johnson", "Robert Smith"],
  Laundry: ["Jane Smith", "David Brown", "Lisa Davis"],
  Maintenance: ["Mike Johnson", "Tom Wilson", "Steve Miller"],
  "Room Service": ["Sarah Williams", "Karen Jones", "Paul Martin"],
  Reception: ["Emily Taylor", "Daniel Anderson", "Laura Thomas"],
};

export const initialTasks = [
  {
    id: 1,
    title: "Clean room 101",
    department: "Housekeeping",
    staff: "John Doe",
    status: "pending",
    priority: "high",
  },
  {
    id: 2,
    title: "Wash guest linens",
    department: "Laundry",
    staff: "Jane Smith",
    status: "completed",
    priority: "medium",
  },
  {
    id: 3,
    title: "Fix AC in room 205",
    department: "Maintenance",
    staff: "Mike Johnson",
    status: "in-progress",
    priority: "high",
  },
  {
    id: 4,
    title: "Deliver breakfast to room 302",
    department: "Room Service",
    staff: "Sarah Williams",
    status: "pending",
    priority: "medium",
  },
];
