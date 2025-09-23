// src/components/orders/Orders.jsx
import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const StatusBadge = ({ status }) => {
  let colorClass = "";
  switch (status) {
    case "completed":
    case "ready":
    case "served":
      colorClass = "bg-green-100 text-green-800";
      break;
    case "cancelled":
      colorClass = "bg-red-100 text-red-800";
      break;
    case "pending":
    case "preparing":
      colorClass = "bg-yellow-100 text-yellow-800";
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800";
  }
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-xs font-medium ${colorClass}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const OrderList = ({
  orders,
  onUpdateOrderStatus,
  isLoading,
  onSearchChange,
  searchTerm,
}) => {
  const orderStatuses = [
    "pending",
    "preparing",
    "ready",
    "served",
    "completed",
    "cancelled",
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Restaurant Orders
      </h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search orders by staff or table..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          disabled={isLoading}
        />
      </div>
      {isLoading ? (
        <p className="text-gray-600">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-600">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff / Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.staffName} ({order.tableNo})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <ul className="list-disc list-inside">
                      {order.items?.map((item, index) => (
                        <li key={index}>
                          {item.name || "Item"} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${order.amount?.toFixed(2) || "0.00"}
                    {order.discount > 0 && (
                      <span className="text-xs text-gray-500 block">
                        (-${order.discount.toFixed(2)} discount)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        onUpdateOrderStatus(order._id, e.target.value)
                      }
                      className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full border ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800 border-red-300"
                          : "bg-blue-100 text-blue-800 border-blue-300"
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                      disabled={isLoading}
                    >
                      {orderStatuses.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                          {statusOption.charAt(0).toUpperCase() +
                            statusOption.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const Orders = () => {
  const { axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("/api/restaurant-orders/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const fetchedOrders = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `/api/restaurant-orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success("Order status updated successfully!");
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      order.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <header className="text-center mb-8 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Orders Management
        </h1>
        <p className="text-gray-600">View and manage restaurant orders</p>
      </header>
      <main className="w-full max-w-6xl mx-auto">
        <OrderList
          orders={filteredOrders}
          onUpdateOrderStatus={updateOrderStatus}
          isLoading={isLoading}
          onSearchChange={setSearchTerm}
          searchTerm={searchTerm}
        />
      </main>
    </div>
  );
};

export default Orders;
