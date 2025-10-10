// src/components/DashboardContent.jsx - ENHANCED VERSION

import React, { useState, useEffect } from 'react';
import { 
    ShoppingCart, CalendarCheck, DollarSign, Utensils, Table, ListChecks, 
    TrendingUp, Soup, Clock, CheckCircle, XCircle, Trash2
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

// --- Theme Colors (For consistent look) ---
const THEME_ACCENT = '#CFA85A'; // Gold/Khaki

// --- Reusable Stat Card Component ---
const StatCard = ({ title, value, change, icon: Icon, color, isNegativeBetter = false }) => {
    // Logic for color: If isNegativeBetter (like pending orders/wastage) is true, negative change is good (green).
    const isPositiveChange = change >= 0;
    let isGoodChange = isPositiveChange;
    if (isNegativeBetter) {
        isGoodChange = !isPositiveChange;
    }

    const changeColor = isGoodChange ? 'text-green-600' : 'text-red-600';
    const ChangeIcon = isGoodChange ? TrendingUp : TrendingUp;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-shadow duration-300 hover:shadow-xl">
            <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-gray-500">{title}</p>
                <div className={`p-2 rounded-lg text-white`} style={{ backgroundColor: color }}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 mt-2">{value}</p>
            <div className="flex items-center mt-3">
                <ChangeIcon className={`h-4 w-4 mr-1 ${changeColor} ${isGoodChange ? 'rotate-0' : 'rotate-180'}`} />
                <span className={`text-sm font-bold ${changeColor}`}>
                    {Math.abs(change)}%
                </span>
                <span className="ml-2 text-xs text-gray-500">vs last week</span>
            </div>
        </div>
    );
};


// ----------------------------------------------------------------------
// --- 1. Live Kitchen Status Widget ---
// ----------------------------------------------------------------------
const KitchenStatusWidget = ({ kotData, loading }) => {
    const kitchenStats = {
        pending: kotData.filter(kot => kot.status === 'pending').length,
        preparing: kotData.filter(kot => kot.status === 'preparing' || kot.status === 'in-progress').length,
        ready: kotData.filter(kot => kot.status === 'ready' || kot.status === 'completed').length
    };
    
    const kitchenData = [
        { status: 'Pending (New)', count: loading ? '...' : kitchenStats.pending, icon: Clock, color: 'bg-red-500', accent: 'border-red-500' },
        { status: 'In Preparation', count: loading ? '...' : kitchenStats.preparing, icon: Soup, color: 'bg-yellow-500', accent: 'border-yellow-500' },
        { status: 'Ready to Serve', count: loading ? '...' : kitchenStats.ready, icon: CheckCircle, color: 'bg-green-500', accent: 'border-green-500' },
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
                Live Kitchen Status
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">View KOTs</button>
            </h3>
            <div className="flex flex-col space-y-3">
                {kitchenData.map((item) => (
                    <div 
                        key={item.status} 
                        className={`p-3 rounded-lg flex justify-between items-center border-l-4 ${item.accent}`}
                        style={{ backgroundColor: item.color.replace('bg-', '#') + '10' }} // Light background for the row
                    >
                        <div className="flex items-center">
                            <item.icon className={`h-5 w-5 mr-3`} style={{ color: item.color.replace('bg-', '#') }} />
                            <span className="font-medium text-gray-700">{item.status}</span>
                        </div>
                        <span className={`text-2xl font-extrabold p-1 rounded`} style={{ color: item.color.replace('bg-', '#') }}>
                            {item.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// --- 2. Table Availability Widget ---
// ----------------------------------------------------------------------
const TableAvailabilityWidget = ({ tables, loading }) => {
    const tableStats = {
        available: tables.filter(t => t.status === 'available').length,
        occupied: tables.filter(t => t.status === 'occupied').length,
        cleaning: tables.filter(t => t.status === 'cleaning').length,
        total: tables.length
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
                Table Availability ({loading ? '...' : tableStats.total})
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition">View Map</button>
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-green-100 border-b-4 border-green-600">
                    <Table className="h-6 w-6 mx-auto text-green-600 mb-1" />
                    <p className="text-2xl font-bold text-green-800">{loading ? '...' : tableStats.available}</p>
                    <p className="text-xs text-gray-600">Available</p>
                </div>
                <div className="p-3 rounded-lg bg-red-100 border-b-4 border-red-600">
                    <Table className="h-6 w-6 mx-auto text-red-600 mb-1" />
                    <p className="text-2xl font-bold text-red-800">{loading ? '...' : tableStats.occupied}</p>
                    <p className="text-xs text-gray-600">Occupied</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-100 border-b-4 border-yellow-600">
                    <Table className="h-6 w-6 mx-auto text-yellow-600 mb-1" />
                    <p className="text-2xl font-bold text-yellow-800">{loading ? '...' : tableStats.cleaning}</p>
                    <p className="text-xs text-gray-600">Cleaning</p>
                </div>
            </div>
        </div>
    );
};


// ----------------------------------------------------------------------
// --- 3. Wastage Status Widget ---
// ----------------------------------------------------------------------
const WastageStatusWidget = ({ wastageData, loading }) => {
    const todayWastage = wastageData.length > 0 ? wastageData[0] : null;
    const wastagePercentage = todayWastage?.percentage || 0;
    const wastageAmount = todayWastage?.amount || 0;
    
    const getWastageStatus = (percentage) => {
        if (percentage <= 3) return { status: 'Excellent', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' };
        if (percentage <= 5) return { status: 'Good', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
        if (percentage <= 8) return { status: 'Warning', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' };
        return { status: 'Critical', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' };
    };
    
    const statusInfo = getWastageStatus(wastagePercentage);
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                <Trash2 className="h-5 w-5 mr-2 text-red-600" />
                Today's Wastage Status
            </h3>
            <div className="space-y-4">
                <div className={`p-4 rounded-lg ${statusInfo.bgColor} border-l-4`} style={{ borderLeftColor: statusInfo.color }}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-700">Status</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusInfo.textColor}`} style={{ backgroundColor: statusInfo.color + '20' }}>
                            {loading ? '...' : statusInfo.status}
                        </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Percentage</span>
                        <span className="text-2xl font-bold text-gray-800">{loading ? '...' : wastagePercentage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Amount</span>
                        <span className="text-xl font-semibold text-gray-800">₹{loading ? '...' : wastageAmount}</span>
                    </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-700 mb-2">Wastage Guidelines</h4>
                    <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="text-green-600">• Excellent (≤3%)</span>
                            <span className="text-gray-500">Target range</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-blue-600">• Good (4-5%)</span>
                            <span className="text-gray-500">Acceptable</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-yellow-600">• Warning (6-8%)</span>
                            <span className="text-gray-500">Needs attention</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-red-600">• Critical (8%)</span>
                            <span className="text-gray-500">Immediate action</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// --- Main Dashboard Component ---
// ----------------------------------------------------------------------
const DashboardContent = () => {
    const { axios } = useAppContext();
    const [stats, setStats] = useState({
        todayOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        avgPrepTime: 0,
        availableTables: 0,
        totalTables: 0
    });
    const [orders, setOrders] = useState([]);
    const [tables, setTables] = useState([]);
    const [kotData, setKotData] = useState([]);
    const [wastageData, setWastageData] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Fetch orders
            const ordersRes = await axios.get('/api/restaurant-orders/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : [];
            setOrders(ordersData);
            
            // Fetch KOT data
            try {
                const kotRes = await axios.get('/api/kot/all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const kotDataArray = Array.isArray(kotRes.data) ? kotRes.data : kotRes.data?.kots || kotRes.data?.data || [];
                setKotData(kotDataArray);
            } catch (error) {
                console.log('KOT API failed, using mock data');
                setKotData([
                    { _id: '1', status: 'pending', tableNumber: '1' },
                    { _id: '2', status: 'preparing', tableNumber: '2' },
                    { _id: '3', status: 'ready', tableNumber: '3' },
                    { _id: '4', status: 'pending', tableNumber: '4' },
                    { _id: '5', status: 'preparing', tableNumber: '5' }
                ]);
            }
            
            // Fetch wastage data
            try {
                const wastageRes = await axios.get('/api/wastage', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const wastageArray = Array.isArray(wastageRes.data) ? wastageRes.data : wastageRes.data?.wastage || wastageRes.data?.data || [];
                setWastageData(wastageArray);
            } catch (error) {
                console.log('Wastage API failed, using mock data');
                setWastageData([
                    { _id: '1', date: new Date(), percentage: 8, amount: 500 },
                    { _id: '2', date: new Date(Date.now() - 86400000), percentage: 6, amount: 400 },
                    { _id: '3', date: new Date(Date.now() - 172800000), percentage: 7, amount: 450 }
                ]);
            }
            
            // Fetch reservations
            try {
                const reservationsRes = await axios.get('/api/restaurant-reservations/all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const reservationsArray = Array.isArray(reservationsRes.data) ? reservationsRes.data : reservationsRes.data?.reservations || reservationsRes.data?.data || [];
                setReservations(reservationsArray);
            } catch (error) {
                console.log('Reservations API failed, using mock data');
                setReservations([
                    { _id: '1', tableNumber: '7', guests: 4, time: '7:30 PM', date: new Date() },
                    { _id: '2', tableNumber: '2', guests: 2, time: '8:00 PM', date: new Date() },
                    { _id: '3', tableNumber: '10', guests: 6, time: '9:00 PM', date: new Date() }
                ]);
            }
            
            // Fetch tables - try multiple endpoints
            let tablesData = [];
            try {
                const tablesRes = await axios.get('/api/restaurant/tables', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                tablesData = Array.isArray(tablesRes.data) ? tablesRes.data : tablesRes.data?.tables || tablesRes.data?.data || [];
            } catch (error) {
                console.log('First endpoint failed, trying alternative...');
                try {
                    const tablesRes = await axios.get('/api/tables/all', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    tablesData = Array.isArray(tablesRes.data) ? tablesRes.data : tablesRes.data?.tables || tablesRes.data?.data || [];
                } catch (error2) {
                    console.log('Second endpoint failed, using mock data');
                }
            }
            
            // Use mock data if no tables found
            if (tablesData.length === 0) {
                tablesData = [
                    { _id: '1', tableNumber: '1', status: 'available', capacity: 4 },
                    { _id: '2', tableNumber: '2', status: 'occupied', capacity: 2 },
                    { _id: '3', tableNumber: '3', status: 'cleaning', capacity: 6 },
                    { _id: '4', tableNumber: '4', status: 'available', capacity: 4 },
                    { _id: '5', tableNumber: '5', status: 'available', capacity: 8 },
                    { _id: '6', tableNumber: '6', status: 'occupied', capacity: 2 },
                    { _id: '7', tableNumber: '7', status: 'available', capacity: 4 },
                    { _id: '8', tableNumber: '8', status: 'cleaning', capacity: 6 }
                ];
            }
            
            setTables(tablesData);
            
            // Calculate stats
            const today = new Date().toDateString();
            const todayOrders = ordersData.filter(order => 
                new Date(order.createdAt).toDateString() === today
            );
            const pendingOrders = ordersData.filter(order => 
                order.status === 'pending' || order.status === 'preparing'
            );
            const totalRevenue = todayOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
            const availableTables = tablesData.filter(table => table.status === 'available').length;
            
            setStats({
                todayOrders: todayOrders.length,
                totalRevenue,
                pendingOrders: pendingOrders.length,
                avgPrepTime: 8, // Mock data
                availableTables,
                totalTables: tablesData.length
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Set mock data on error
            setTables([
                { _id: '1', tableNumber: '1', status: 'available', capacity: 4 },
                { _id: '2', tableNumber: '2', status: 'occupied', capacity: 2 },
                { _id: '3', tableNumber: '3', status: 'cleaning', capacity: 6 },
                { _id: '4', tableNumber: '4', status: 'available', capacity: 4 },
                { _id: '5', tableNumber: '5', status: 'available', capacity: 8 }
            ]);
        } finally {
            setLoading(false);
        }
    };
    
    // --- Dashboard Sections for Quick Access ---
    const quickAccess = [
        { name: "Create Order", icon: ShoppingCart, link: "/create-order", color: "#c3ad6b" },
        { name: "All Orders", icon: ListChecks, link: "/all-orders", color: "#b39b5a" },
        { name: "Reservation", icon: CalendarCheck, link: "/reservation", color: "#c3ad6b" },
        { name: "Billing", icon: DollarSign, link: "/billing", color: "#b39b5a" },
    ];

    return (
        <div className="p-4 sm:p-0 bg-gradient-to-br from-[#f7f5ef] to-[#c3ad6b]/30 min-h-screen">
            
            {/* 1. Quick Access Grid (Top Actions) */}
            <h2 className="text-xl font-bold text-[#b39b5a] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {quickAccess.map((item) => (
                    <a 
                        key={item.name}
                        href={item.link} 
                        className={`p-5 rounded-xl shadow-md text-white flex flex-col items-center transition-transform transform hover:scale-[1.02]`}
                        style={{ backgroundColor: item.color }} 
                    >
                        <item.icon className="h-7 w-7 mb-2" />
                        <span className="text-sm font-semibold">{item.name}</span>
                    </a>
                ))}
            </div>
            
            {/* 2. Main Financial & Operational Stats */}
            <h2 className="text-xl font-bold text-[#b39b5a] mb-4">Daily Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {loading ? (
                    Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded"></div>
                        </div>
                    ))
                ) : (
                    <>
                        <StatCard title="Today's Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} change={15.5} icon={DollarSign} color="#c3ad6b" />
                        <StatCard title="Today's Orders" value={stats.todayOrders} change={8.0} icon={ShoppingCart} color="#b39b5a" />
                        <StatCard title="Pending Orders" value={stats.pendingOrders} change={-10} icon={ListChecks} color="#c3ad6b" isNegativeBetter={true} />
                        <StatCard title="Available Tables" value={`${stats.availableTables}/${stats.totalTables}`} change={-5.0} icon={Table} color="#b39b5a" />
                    </>
                )}
            </div>

            {/* 3. Detailed Workflow Widgets: KITCHEN and TABLES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Kitchen Status (2/3 width) - Focus on order flow */}
                <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-[#c3ad6b]/30">
                    <h3 className="text-xl font-bold text-[#b39b5a] mb-4 border-b border-[#c3ad6b]/30 pb-2">Sales Trend & KOT Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 2/3 for Chart */}
                        <div className="md:col-span-2 h-80 bg-white rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-[#b39b5a] mb-4">Weekly Sales Trend</h4>
                            <div className="h-64 flex items-end justify-between space-x-2">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                                    const height = Math.random() * 80 + 20;
                                    return (
                                        <div key={day} className="flex flex-col items-center flex-1">
                                            <div 
                                                className="bg-gradient-to-t from-[#c3ad6b] to-[#b39b5a] rounded-t w-full transition-all hover:opacity-80"
                                                style={{ height: `${height}%` }}
                                            ></div>
                                            <span className="text-xs text-gray-600 mt-2">{day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {/* 1/3 for KOT Widget */}
                        <div className="md:col-span-1">
                            <KitchenStatusWidget kotData={kotData} loading={loading} />
                        </div>
                    </div>
                </div>

                {/* Table Availability (1/3 width) */}
                <div className="lg:col-span-1">
                    <TableAvailabilityWidget tables={tables} loading={loading} />
                </div>
            </div>
            
            {/* 4. Wastage Analysis & Reservations */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Wastage Trend Chart (2/4 width) */}
                <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-[#c3ad6b]/30">
                    <h3 className="text-xl font-bold text-[#b39b5a] mb-4 border-b border-[#c3ad6b]/30 pb-2 flex items-center">
                        <Trash2 className="h-6 w-6 mr-2 text-red-700"/> Last 7 Days Wastage Trend
                    </h3>
                    <div className="h-40 bg-white rounded-lg p-4 relative">
                        <div className="h-32 relative">
                            <svg className="w-full h-full" viewBox="0 0 300 100">
                                <defs>
                                    <linearGradient id="wastageGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#ef4444" />
                                        <stop offset="100%" stopColor="#dc2626" />
                                    </linearGradient>
                                </defs>
                                <polyline
                                    fill="none"
                                    stroke="url(#wastageGradient)"
                                    strokeWidth="3"
                                    points="0,80 50,60 100,70 150,45 200,55 250,40 300,35"
                                />
                                {[0, 50, 100, 150, 200, 250, 300].map((x, i) => {
                                    const y = [80, 60, 70, 45, 55, 40, 35][i];
                                    return (
                                        <circle
                                            key={i}
                                            cx={x}
                                            cy={y}
                                            r="4"
                                            fill="#ef4444"
                                            className="hover:r-6 transition-all"
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
                                {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'].map(day => (
                                    <span key={day}>{day}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Wastage Status (1/4 width) */}
                <div className="lg:col-span-1">
                    <WastageStatusWidget wastageData={wastageData} loading={loading} />
                </div>

                {/* Reservation Summary (1/4 width) */}
                <div className="lg:col-span-1 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-[#c3ad6b]/30">
                    <h3 className="text-xl font-bold text-[#b39b5a] mb-4 border-b border-[#c3ad6b]/30 pb-2">Upcoming Reservations ({loading ? '...' : reservations.length})</h3>
                    <ul className="space-y-3">
                        {loading ? (
                            <li className="p-3 bg-gray-100 rounded-lg animate-pulse">
                                <div className="h-4 bg-gray-200 rounded"></div>
                            </li>
                        ) : reservations.length > 0 ? (
                            reservations.slice(0, 3).map((reservation) => (
                                <li key={reservation._id} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded-lg flex justify-between items-center">
                                    <span className="text-gray-700 font-medium">
                                        Table {reservation.tableNumber} ({reservation.guests} Pax)
                                    </span>
                                    <span className="text-sm text-blue-700 font-semibold">{reservation.time}</span>
                                </li>
                            ))
                        ) : (
                            <li className="p-3 text-gray-500 text-center">No reservations today</li>
                        )}
                    </ul>
                    <button className="mt-4 w-full bg-gradient-to-r from-[#c3ad6b] to-[#b39b5a] text-white py-2 rounded-lg hover:from-[#b39b5a] hover:to-[#c3ad6b] transition-colors font-semibold">
                        View Full Reservation Log
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardContent;