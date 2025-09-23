import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  BarChart2,
  FileText,
  HelpCircle,
  Settings,
  UserCheck,
  ChartBarStacked,
  BedDouble,
  LogOut,
  UserRound,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Package,
  Bell,
} from "lucide-react";
import logoImage from "../assets/buddhaavenuelogo.png";

const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showSettingsSlider, setShowSettingsSlider] = useState(false);


  const { isSidebarOpen, closeSidebar, axios } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLaundaryDropdownOpen, setIsLaundaryDropdownOpen] = useState(false);

  const [userRole, setUserRole] = useState("");
  const [restaurantRole, setRestaurantRole] = useState("");
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const restRole = localStorage.getItem("restaurantRole");
    console.log('Debug - role:', role, 'restaurantRole:', restRole);
    setUserRole(role ? role.toUpperCase() : "");
    setRestaurantRole(restRole ? restRole.toUpperCase() : "");
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const restRole = localStorage.getItem("restaurantRole");
    console.log('Debug 2 - role:', role, 'restaurantRole:', restRole);
    setUserRole(role ? role.toUpperCase() : "");
    setRestaurantRole(restRole ? restRole.toUpperCase() : "");

    if (role === "staff") {
      fetchTaskCount();
      const interval = setInterval(fetchTaskCount, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchTaskCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) return;

      const { data } = await axios.get("/api/housekeeping/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && Array.isArray(data.tasks)) {
        const userPendingTasks = data.tasks.filter(
          (task) =>
            task.assignedTo &&
            task.assignedTo._id === userId &&
            task.status === "pending"
        );
        setTaskCount(userPendingTasks.length);
      }
    } catch (err) {
      console.error("Error fetching task count:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  // Touch handler for mobile - tap anywhere to close sidebar when open
  const handleMobileTouch = (e) => {
    // Only on mobile devices and only when sidebar is open
    if (window.innerWidth >= 768 || !isSidebarOpen) return;
    
    // Don't trigger if touching sidebar itself or its children
    const sidebar = document.querySelector('aside');
    if (sidebar && sidebar.contains(e.target)) return;
    
    // Close sidebar
    closeSidebar();
  };

  // Add touch listener to document for mobile
  useEffect(() => {
    document.addEventListener('touchstart', handleMobileTouch);
    return () => {
      document.removeEventListener('touchstart', handleMobileTouch);
    };
  }, [isSidebarOpen]);


  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: UserCheck, label: "Task Assigned", path: "/tasks" },
    { icon: ChartBarStacked, label: "Category", path: "/category" },
    { icon: BedDouble, label: "Room", path: "/room" },
    { icon: FileText, label: "Booking", path: "/booking" },
    { icon: FileText, label: "Room Inspection", path: "/room-inspection" },
    // { icon: FileText, label: "Checkout", path: "/checkout" },
    { icon: FileText, label: "Reservation", path: "/reservation" },
    { icon: Bell, label: "My Task", path: "/staff-work", count: taskCount },
    { icon: UserRound, label: "Staff", path: "/staff" },
    {
      icon: UserRound,
      label: "Laundary",
      path: "/laundry",
      isDropdown: true,
      children: [
        {
          label: "Order Management",
          path: "/laundry/ordermanagement",
          icon: ListChecks,
        },
        // {
        //   label: "Inventory Management",
        //   path: "/laundry/inventorymanagement",
        //   icon: Package,
        // },
      ],
    },
    {
      icon: UserRound,
      label: "Pantry",
      path: "/pantry",
      isDropdown: true,
      children: [
        { label: "Item", path: "/pantry/item", icon: ListChecks },
        { label: "Orders", path: "/pantry/orders", icon: Package },
      ],
    },
    {
      icon: UserRound,
      label: "Cab",
      path: "/cab",
      isDropdown: true,
      children: [
        { label: "Driver Management", path: "/cab/driver", icon: ListChecks },
        { label: "Vehicle Management", path: "/cab/vehicle", icon: Package },
      ],
    },
    {
      icon: UserRound,
      label: "Resturant",
      path: "/resturant",
      isDropdown: true,
      children: (() => {
        const mainRole = localStorage.getItem("role");
        const restRole = localStorage.getItem("restaurantRole");
        
        // If main role is staff, show staff menu
        if (mainRole === 'staff') {
          return [
            { label: "Order", path: "/resturant/order-table", icon: ShoppingCart },
            { label: "Reservation", path: "/resturant/reservation", icon: FileText },
            { label: "KOT", path: "/kot", icon: ListChecks },
          ];
        }
        
        // Check restaurant specific roles
        if (restRole === 'chef') {
          return [
            { label: "KOT", path: "/kot", icon: ListChecks },
            { label: "Order", path: "/resturant/order-table", icon: ShoppingCart },
          ];
        } else if (restRole === 'cashier') {
          return [
            { label: "Order", path: "/resturant/order-table", icon: ShoppingCart },
            { label: "Billing", path: "/billing", icon: FileText },
            { label: "KOT", path: "/kot", icon: ListChecks },
          ];
        }
        
        // Default admin view
        return [
          { label: "Order", path: "/resturant/order-table", icon: ShoppingCart },
          { label: "Reservation", path: "/resturant/reservation", icon: FileText },
          { label: "KOT", path: "/kot", icon: ListChecks },
          { label: "Billing", path: "/billing", icon: FileText },
          { label: "Menu", path: "/menu", icon: UserRound },
          { label: "Tables", path: "/table", icon: UserRound },
        ];
      })(),
    },
    {
      icon: UserRound,
      label: "Banquet",
      path: "/banquet",
      isDropdown: true,
      children: [
        { label: "Calendar", path: "/banquet/calendar", icon: FileText },
        { label: "List Bookings", path: "/banquet/list-booking", icon: Package },
        { label: "Menu & Plans", path: "/banquet/menu-plan-manager", icon: Settings },
      ],
    },
    { icon: Users, label: "Customers", path: "/customers" },
    { icon: Users, label: "All Users", path: "/users" }
    // { icon: Users, label: "Payment", path: "/payment" },
    // { icon: FileText, label: "Invoice", path: "/invoice" },
  ];

  const settingsItems = [
    { label: "General Settings", path: "/settings/general" },
    { label: "Business / Hotel Settings", path: "/settings/business" },
    { label: "User & Role Settings", path: "/settings/users" },
    { label: "Notifications & Alerts", path: "/settings/notifications" },
    { label: "Operational Settings", path: "/settings/operational" },
    { label: "Security Settings", path: "/settings/security" },
    { label: "Data & Backup", path: "/settings/data" },
    { label: "Integrations", path: "/settings/integrations" },
  ];

  const bottomNavItems = [
    { icon: HelpCircle, label: "Help & Support", path: "/help" },
    { icon: Settings, label: "Settings", isSlider: true },
  ];

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 bg-[#1f2937] text-[#c2ab65] w-full sm:w-64 max-w-xs transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 z-30 flex flex-col h-screen overflow-y-auto`}
      >
      <div className="flex items-center justify-between md:justify-center p-2">
        <img src={logoImage} alt="Buddha Avenue" className="h-20 sm:h-24 md:h-30" />
        <button
          onClick={closeSidebar}
          className="md:hidden p-2 text-[#c2ab65] hover:text-white"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="text-center mt-2 font-bold text-base sm:text-lg">{userRole}</div>

      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
        {navItems.map((item, index) => (
          <div key={index}>
            {item.isDropdown ? (
              <>
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className={`flex items-center justify-between w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 focus:outline-none text-sm sm:text-base
                    ${
                      location.pathname.startsWith(item.path) ||
                      item.children.some(
                        (child) => location.pathname === child.path
                      )
                        ? "bg-[#c2ab65] text-[#1f2937] font-semibold"
                        : ""
                    }`}
                >
                  <div className="flex items-center">
                    <item.icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {openDropdown === item.label ? (
                    <ChevronUp className="w-3 sm:w-4 h-3 sm:h-4" />
                  ) : (
                    <ChevronDown className="w-3 sm:w-4 h-3 sm:h-4" />
                  )}
                </button>
                {openDropdown === item.label && (
                  <div className="ml-6 sm:ml-8 mt-1 space-y-1">
                    {item.children.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        to={subItem.path}
                        onClick={() =>
                          window.innerWidth < 768 && closeSidebar()
                        }
                        className={`flex items-center px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm
                          ${
                            location.pathname === subItem.path
                              ? "bg-[#c2ab65] text-[#1f2937] font-semibold"
                              : ""
                          }`}
                      >
                        {subItem.icon && (
                          <subItem.icon className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
                        )}
                        <span className="truncate">{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                onClick={() => window.innerWidth < 768 && closeSidebar()}
                className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors duration-200 text-sm sm:text-base ${
                  location.pathname === item.path
                    ? "bg-[#c2ab65] text-[#1f2937] font-semibold"
                    : ""
                }`}
              >
                <div className="flex items-center min-w-0">
                  <item.icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-xs rounded-full px-2 py-1 min-w-[20px] text-center flex-shrink-0 ${
                    item.count > 0 ? 'bg-red-500 text-white' : 'bg-gray-400 text-white'
                  }`}>
                    {item.count}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="p-3 sm:p-4 border-t border-secondary">
        {bottomNavItems.map((item, index) => (
          <div key={index}>
            {item.isSlider ? (
              <button
                onClick={() => setShowSettingsSlider(true)}
                className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-hover transition-colors duration-200 w-full text-left text-sm sm:text-base"
              >
                <item.icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" />
                <span className="truncate">{item.label}</span>
              </button>
            ) : (
              <Link
                to={item.path}
                onClick={() => window.innerWidth < 768 && closeSidebar()}
                className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-hover transition-colors duration-200 text-sm sm:text-base"
              >
                <item.icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" />
                <span className="truncate">{item.label}</span>
              </Link>
            )}
          </div>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-hover transition-colors duration-200 w-full text-left text-sm sm:text-base"
        >
          <LogOut className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" />
          <span className="truncate">Logout</span>
        </button>
      </div>

      </aside>

      {/* Settings Card - Mobile Responsive */}
      {showSettingsSlider && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowSettingsSlider(false)} />
          <div className="fixed left-0 md:left-64 bottom-0 md:bottom-16 z-50 w-full md:w-auto">
            <div className="bg-white w-full md:w-60 rounded-t-lg md:rounded-lg shadow-lg border max-h-96 overflow-y-auto" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
              <div className="p-3 border-b flex justify-between items-center" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                <h3 className="text-sm font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>
                  Settings
                </h3>
                <button 
                  onClick={() => setShowSettingsSlider(false)}
                  className="md:hidden p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-2 space-y-1 pb-4 md:pb-2">
                {settingsItems.map((setting, index) => (
                  <Link
                    key={index}
                    to={setting.path}
                    onClick={() => {
                      setShowSettingsSlider(false);
                      window.innerWidth < 768 && closeSidebar();
                    }}
                    className="block p-3 md:p-2 rounded hover:bg-gray-50 transition-colors text-sm md:text-xs"
                  >
                    <span style={{color: 'hsl(45, 100%, 20%)'}}>
                      {setting.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
