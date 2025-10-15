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
  Warehouse,
  Book,
} from "lucide-react";
import logoImage from "../assets/Lakeview Rooftop.png";

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
    const departments = localStorage.getItem("departments");
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    
    console.log('=== USER DATA ===');
    console.log('Role:', role);
    console.log('Restaurant Role:', restRole);
    console.log('Departments:', departments);
    console.log('User ID:', userId);
    console.log('Token:', token);
    console.log('================');
    
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


  const getAuthorizedNavItems = () => {
    const role = localStorage.getItem("role");
    const restaurantRole = localStorage.getItem("restaurantRole");
    let userDepartments = [];
    try {
      const departmentData = localStorage.getItem("department") || localStorage.getItem("departments");
      userDepartments = departmentData && departmentData !== 'undefined' ? JSON.parse(departmentData) : [];
    } catch (e) {
      userDepartments = [];
    }
    const hasHousekeeping = userDepartments.some(dept => dept && dept.name === "housekeeping");
    const hasReception = userDepartments.some(dept => dept && dept.name === "reception");
    const hasLaundry = userDepartments.some(dept => dept && dept.name === "laundry");
    
    console.log('=== DEPARTMENT CHECK ===');
    console.log('Role:', role);
    console.log('Restaurant Role:', restaurantRole);
    console.log('User Departments:', userDepartments);
    console.log('Has Housekeeping:', hasHousekeeping);
    console.log('Has Reception:', hasReception);
    console.log('Has Laundry:', hasLaundry);
    console.log('=======================');
    
    const items = [];

    // Dashboard - accessible to all
    items.push({ icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" });
    
    // Easy Dashboard - admin only
    if (role === "admin") {
      items.push({ icon: LayoutDashboard, label: "Easy Dashboard", path: "/easy-dashboard" });
    }
    
    // If restaurant role (cashier, chef, waiter), return only dashboard items
    if (role === "restaurant" && (restaurantRole === "cashier" || restaurantRole === "chef" || restaurantRole === "staff")) {
      return items;
    }
    
    // If staff has only laundry department, return only dashboard items
    if (role === "staff" && userDepartments.length === 1 && hasLaundry) {
      return items;
    }
    
    // Cash Management - accessible to both admin and staff
    if (role === "admin" || role === "staff") {
      items.push({ icon: BarChart2, label: "Cash Management", path: "/cash-management" });
    }

    // Admin only items
    if (role === "admin") {
      items.push({ icon: FileText, label: "Room Inspection", path: "/room-inspection" });
    }

    // Reception and Admin items - Book dropdown
    if (role === "admin" || (role === "staff" && hasReception)) {
      items.push({
        icon: Book,
        label: "Book",
        path: "/booking",
        isDropdown: true,
        children: [
          { label: "Booking", path: "/booking", icon: FileText },
          { label: "Reservation", path: "/reservation", icon: FileText },
        ],
      });
    }

    // Task management - admin and housekeeping staff
    if (role === "admin" || (role === "staff" && hasHousekeeping)) {
      items.push({ icon: UserCheck, label: "Task Assigned", path: "/tasks" });
    }
    if (role === "staff" && hasHousekeeping) {
      items.push({ icon: Bell, label: "My Task", path: "/staff-work", count: taskCount });
    }

    return items;
  };

  const navItems = [
    ...getAuthorizedNavItems(),
    ...(localStorage.getItem("role") === "admin" ? [{
      icon: UserRound,
      label: "Staff Management",
      path: "/staff",
      isDropdown: true,
      children: [
        { label: "Staff List", path: "/staff", icon: Users },
        { label: "Staff Dashboard", path: "/staff-dashboard", icon: LayoutDashboard },
      ],
    }] : []),
    ...(() => {
      const role = localStorage.getItem("role");
      let userDepartments = [];
      try {
        const departmentData = localStorage.getItem("department") || localStorage.getItem("departments");
        userDepartments = departmentData && departmentData !== 'undefined' ? JSON.parse(departmentData) : [];
      } catch (e) {
        userDepartments = [];
      }
      const hasReception = userDepartments.some(dept => dept && dept.name === "reception");
      
      if (role === "admin" || (role === "staff" && hasReception)) {
        const children = [
          { label: "Room", path: "/room", icon: BedDouble },
        ];
        if (role === "admin") {
          children.push({ label: "Category", path: "/category", icon: ChartBarStacked });
        }
        return [{
          icon: BedDouble,
          label: "Room Management",
          path: "/room",
          isDropdown: true,
          children,
        }];
      }
      return [];
    })(),
    ...(() => {
      const role = localStorage.getItem("role");
      let userDepartments = [];
      try {
        const departmentData = localStorage.getItem("department") || localStorage.getItem("departments");
        userDepartments = departmentData && departmentData !== 'undefined' ? JSON.parse(departmentData) : [];
      } catch (e) {
        userDepartments = [];
      }
      const hasLaundry = userDepartments.some(dept => dept && dept.name === "laundry");
      
      if (role === "admin" || (role === "staff" && hasLaundry)) {
        return [{
          icon: UserRound,
          label: "Laundry",
          path: "/laundry",
          isDropdown: true,
          children: [
            {
              label: "Create Order",
              path: "/laundry/ordermanagement",
              icon: ListChecks,
            },
          ],
        }];
      }
      return [];
    })(),
    ...((localStorage.getItem("role") === "admin" || 
         (() => {
           try {
             const deptData = localStorage.getItem("department") || localStorage.getItem("departments");
             return deptData && deptData !== 'undefined' ? JSON.parse(deptData).some(dept => dept && (dept.name === "kitchen" || dept.name === "reception")) : false;
           } catch (e) {
             return false;
           }
         })()) ? [{
      icon: UserRound,
      label: "Pantry",
      path: "/pantry",
      isDropdown: true,
      children: [
        { label: "Item", path: "/pantry/item", icon: ListChecks },
        { label: "Create Category", path: "/pantry/category", icon: ChartBarStacked },
        { label: "Orders", path: "/pantry/orders", icon: Package },
        { label: "Vendors", path: "/pantry/vendors", icon: Users },
      ],
    }] : []),

    ...(() => {
      const mainRole = localStorage.getItem("role");
      const restRole = localStorage.getItem("restaurantRole");
      const username = localStorage.getItem("username");
      let userDepartments = [];
      try {
        const departmentData = localStorage.getItem("department") || localStorage.getItem("departments");
        userDepartments = departmentData && departmentData !== 'undefined' ? JSON.parse(departmentData) : [];
      } catch (e) {
        userDepartments = [];
      }
      const hasKitchen = userDepartments.some(dept => dept && dept.name === "kitchen");
      const hasReception = userDepartments.some(dept => dept && dept.name === "reception");
      
      // Show restaurant for admin, restaurant roles, or staff with kitchen/reception
      if (mainRole === "admin" || mainRole === "restaurant" || 
          (mainRole === "staff" && (hasKitchen || hasReception))) {
        return [{
          icon: UserRound,
          label: "Restaurant",
          path: "/resturant",
          isDropdown: true,
          children: (() => {
            console.log('=== RESTAURANT DROPDOWN DEBUG ===');
            console.log('Main Role:', mainRole);
            console.log('Restaurant Role:', restRole);
            console.log('Username:', username);
            console.log('================================');
            
            // For restaurant role users - use restaurantRole
            if (mainRole === 'restaurant') {
              if (restRole === 'chef') {
                console.log('Chef menu selected - showing only KOT');
                return [
                  { label: "KOT", path: "/kot", icon: ListChecks },
                ];
              } else if (restRole === 'cashier') {
                console.log('Cashier menu selected - showing Order, Billing, KOT');
                return [
                  { label: "Create Order", path: "/resturant/order-table", icon: ShoppingCart },
                  { label: "All Orders", path: "/resturant/all-orders", icon: ListChecks },
                  { label: "Billing", path: "/billing", icon: FileText },
                  { label: "KOT", path: "/kot", icon: ListChecks },
                ];
              } else if (restRole === 'staff') {
                console.log('Restaurant staff menu selected');
                return [
                  { label: "Create Order", path: "/resturant/order-table", icon: ShoppingCart },
                  { label: "All Orders", path: "/resturant/all-orders", icon: ListChecks },
                  { label: "Reservation", path: "/resturant/reservation", icon: FileText },
                ];
              }
              // If restaurant role but no specific restaurantRole, return empty
              console.log('Restaurant role but no specific restaurantRole found');
              return [];
            }
            
            // Staff with kitchen/reception
            if (mainRole === 'staff') {
              console.log('Staff menu selected - showing Order, Reservation, KOT');
              return [
                { label: "Create Order", path: "/resturant/order-table", icon: ShoppingCart },
                { label: "All Orders", path: "/resturant/all-orders", icon: ListChecks },
                { label: "Reservation", path: "/resturant/reservation", icon: FileText },
                { label: "KOT", path: "/kot", icon: ListChecks },
              ];
            }
            
            // Admin view only
            if (mainRole === 'admin') {
              console.log('Admin menu selected - showing all options');
              return [
                { label: "Dashboard", path: "/resturant/dashboard", icon: LayoutDashboard },
                { label: "Create Order", path: "/resturant/order-table", icon: ShoppingCart },
                { label: "All Orders", path: "/resturant/all-orders", icon: ListChecks },
                { label: "Reservation", path: "/resturant/reservation", icon: FileText },
                { label: "KOT", path: "/kot", icon: ListChecks },
                { label: "Billing", path: "/billing", icon: FileText },
                { label: "Menu", path: "/menu", icon: UserRound },
                { label: "Tables", path: "/table", icon: UserRound },
                { label: "Wastage", path: "/wastage", icon: Package },
              ];
            }
            
            // Fallback - should not reach here
            console.log('Fallback - no menu items');
            return [];
          })(),
        }];
      }
      return [];
    })(),
    ...((localStorage.getItem("role") === "admin" || 
         (() => {
           try {
             const deptData = localStorage.getItem("department") || localStorage.getItem("departments");
             return deptData && deptData !== 'undefined' ? JSON.parse(deptData).some(dept => dept && dept.name === "reception") : false;
           } catch (e) {
             return false;
           }
         })()) ? [{
      icon: UserRound,
      label: "Banquet",
      path: "/banquet",
      isDropdown: true,
      children: [
        { label: "Calendar", path: "/banquet/calendar", icon: FileText },
        { label: "List Bookings", path: "/banquet/list-booking", icon: Package },
        { label: "Menu & Plans", path: "/banquet/menu-plan-manager", icon: Settings },
      ],
    }] : []),
    ...((localStorage.getItem("role") === "admin" || 
         (() => {
           try {
             const deptData = localStorage.getItem("department") || localStorage.getItem("departments");
             return deptData && deptData !== 'undefined' ? JSON.parse(deptData).some(dept => dept && dept.name === "reception") : false;
           } catch (e) {
             return false;
           }
         })()) ? [
      { icon: Users, label: "Customers", path: "/customers" }
    ] : []),
    ...(localStorage.getItem("role") === "admin" ? [
      { icon: Users, label: "All Users", path: "/users" },
      { icon: Warehouse, label: "Inventory", path: "/inventory" }
    ] : [])
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
        <img src={logoImage} alt="Lakeview Rooftop" className="h-20 sm:h-24 md:h-30" />
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
                className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg w-full text-left text-sm sm:text-base"
              >
                <item.icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" />
                <span className="truncate">{item.label}</span>
              </button>
            ) : (
              <Link
                to={item.path}
                onClick={() => window.innerWidth < 768 && closeSidebar()}
                className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base"
              >
                <item.icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" />
                <span className="truncate">{item.label}</span>
              </Link>
            )}
          </div>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg w-full text-left text-sm sm:text-base"
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
            <div className="w-full md:w-60 rounded-t-lg md:rounded-lg shadow-lg border max-h-96 overflow-y-auto" style={{background: 'linear-gradient(to bottom, hsl(45, 100%, 95%), hsl(45, 100%, 90%))', borderColor: 'hsl(45, 43%, 58%)'}}>
              <div className="p-3 border-b flex justify-between items-center" style={{background: 'linear-gradient(to bottom, hsl(45, 43%, 58%), hsl(45, 32%, 46%))', borderColor: 'hsl(45, 43%, 58%)'}}>
                <h3 className="text-sm font-semibold text-white">
                  Settings
                </h3>
                <button 
                  onClick={() => setShowSettingsSlider(false)}
                  className="md:hidden p-1 rounded-full hover:bg-white hover:bg-opacity-20 text-white"
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
                    className="block p-3 md:p-2 rounded transition-colors text-sm md:text-xs border border-transparent hover:border-[hsl(45,43%,58%)] hover:bg-[hsl(45,100%,98%)]"
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
