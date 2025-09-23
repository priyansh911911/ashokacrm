
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppContextProvider from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import TaskAssign from "./components/TaskAssign";
import CategoryList from "./components/category/CategoryList.jsx";
import RoomList from "./components/room/RoomList";
import LoginPage from "./components/login/LoginPage";
import StaffList from "./components/staff/StaffList";
import BookingForm from "./components/booking/BookingForm";
import Booking from "./components/booking/Booking";
import CheckoutPage from "./components/booking/CheckoutPage";
import RoomInspection from "./components/RoomInspection";
import Reservation from "./components/reservation/Reservation";
import ReservationForm from "./components/reservation/Reservationform";

import Order from "./components/laundary/Order.jsx";
import Inventory from "./components/laundary/Inventory.jsx";
import { useNavigate } from "react-router-dom";
import Cabbookingform from "./components/cab/cabbookingform.jsx";
import Cab from "./components/cab/cab.jsx";
import Vehile from "./components/cab/Vehicle.jsx";
import Driver from "./components/cab/Driver.jsx";
import PantryItems from "./components/Pantry/Item.jsx";
import PantryOrders from "./components/Pantry/Order.jsx";
import Resturant from "./components/Resturant/Resturant.jsx";
import StaffWorkTask from "./components/StaffWorkTask";
import Orders from "./components/orders/Orders.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Menu from "./components/Resturant/Menu.jsx";
import Table from "./components/Resturant/Table.jsx";
import RestaurantBooking from "./components/Resturant/RestaurantBooking.jsx";
import Category from "./components/Resturant/Category.jsx"
import BookTable from "./components/Resturant/ResturantOrders.jsx";
import KOT from "./components/Resturant/KOT.jsx";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Customer from "./components/Customer.jsx";
import Resturantreservation from "./components/Resturant/Resturantreservation.jsx";
import Billing from "./components/Resturant/Billing.jsx";
import Payment from "./components/payment/Payment.jsx";
import Invoice from "./components/Invoice.jsx";
import Users from "./components/Users/Users.jsx";
import AddBooking from "./components/Banquet/pages/Students/AddBooking.jsx";
import ListBooking from "./components/Banquet/pages/Students/ListBooking.jsx";
import UpdateBooking from "./components/Banquet/pages/Students/UpdateBooking.jsx";
import MenuItemManager from "./components/Banquet/components/MenuItemManager.jsx";
import PlanLimitManager from "./components/Banquet/components/PlanLimitManager.jsx";
import MenuPlanManager from "./components/Banquet/components/MenuPlanManager.jsx";
import LaganCalendar from "./components/Banquet/pages/Calendar/LaganCalendar.jsx";
import MenuSelectorPage from "./components/Banquet/pages/Menu/MenuSelector.jsx";
import MenuView from "./components/Banquet/pages/Students/MenuView.jsx";
import SettingsPage from "./components/Settings/SettingsPage.jsx";
import GeneralSettings from "./components/Settings/GeneralSettings.jsx";
import BusinessSettings from "./components/Settings/BusinessSettings.jsx";
import UserSettings from "./components/Settings/UserSettings.jsx";
import NotificationSettings from "./components/Settings/NotificationSettings.jsx";
import OperationalSettings from "./components/Settings/OperationalSettings.jsx";
import SecuritySettings from "./components/Settings/SecuritySettings.jsx";
import DataBackupSettings from "./components/Settings/DataBackupSettings.jsx";
import IntegrationSettings from "./components/Settings/IntegrationSettings.jsx";
import HelpSupport from "./components/HelpSupport.jsx";
// import CategoryMenu from"./components/Banquet/Students/CategoryMenu.jsx"
const BookingFormPage = () => {
  const navigate = useNavigate();
  return <BookingForm onClose={() => navigate("/booking")} />;
};
const AuthRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};
const App = () => {
  return (
    <AppContextProvider>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/*"
          element={
            <AuthRoute>
              <div className="flex h-screen bg-app-gradient font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-y-auto">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/tasks" element={<TaskAssign />} />
                      <Route path="/category" element={<CategoryList />} />
                      <Route path="/room" element={<RoomList />} />
                      <Route path="/staff" element={<StaffList />} />
                      <Route
                        path="/bookingform"
                        element={<BookingFormPage />}
                      />
                      <Route path="/booking" element={<Booking />} />
                      <Route path="/room-inspection" element={<RoomInspection />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/reservation" element={<Reservation />} />
                      <Route
                        path="/reservationform"
                        element={<ReservationForm />}
                      />
                      <Route
                        path="/laundry/ordermanagement"
                        element={<Order />}
                      />
                      <Route
                        path="/laundry/inventorymanagement"
                        element={<Inventory />}
                      />
                      <Route path="/cab" element={<Cab />} />
                      <Route
                        path="/cabbookingform"
                        element={<Cabbookingform />}
                      />
                      <Route path="/cab/vehicle" element={<Vehile />} />
                      <Route path="/cab/driver" element={<Driver />} />

                      <Route path="/resturant" element={<Resturant />} />
                      <Route path="/pantry/item" element={<PantryItems />} />
                      <Route path="/pantry/orders" element={<PantryOrders />} />
                      <Route 
                        path="/staff-work" 
                        element={
                          <ProtectedRoute allowedRoles={['staff', 'housekeeping', 'admin']}>
                            <StaffWorkTask />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/menu" element={<Menu />} />
                      <Route path="/table" element={<Table />} />
                      <Route path="/resturant/bookings" element={<RestaurantBooking />} />
                      <Route path="/resturant/category" element={<Category />} />
                      <Route path="/book-table" element={<BookTable />} />
                      <Route path="/customers" element={<Customer />} />
                      <Route path="/resturant/order-table" element={<BookTable />} />
                      <Route path="/kot" element={<KOT />} />
                      <Route path="/resturant/reservation" element={<Resturantreservation />} />
                      <Route path="/billing" element={<Billing />} />
                      <Route path="/payment" element={<Payment />} />
                      <Route path="/invoice" element={<Invoice />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/add-booking" element={<AddBooking />} />
                      <Route path="/banquet/add-booking" element={<AddBooking />} />
                      <Route path="/banquet/list-booking" element={<ListBooking />} />
                      <Route path="/banquet/update-booking/:id" element={<UpdateBooking />} />
                      <Route path="/banquet/menu-manager" element={<MenuItemManager />} />
                      <Route path="/banquet/plan-limit" element={<PlanLimitManager />} />
                      <Route path="/banquet/menu-plan-manager" element={<MenuPlanManager />} />
                      <Route path="/banquet/menu-selector" element={<MenuSelectorPage />} />
                      <Route path="/banquet/menu-view/:id" element={<MenuView />} />
                      <Route path="/banquet/calendar" element={<LaganCalendar />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/settings/general" element={<GeneralSettings />} />
                      <Route path="/settings/business" element={<BusinessSettings />} />
                      <Route path="/settings/users" element={<UserSettings />} />
                      <Route path="/settings/notifications" element={<NotificationSettings />} />
                      <Route path="/settings/operational" element={<OperationalSettings />} />
                      <Route path="/settings/security" element={<SecuritySettings />} />
                      <Route path="/settings/data" element={<DataBackupSettings />} />
                      <Route path="/settings/integrations" element={<IntegrationSettings />} />
                      <Route path="/help" element={<HelpSupport />} />
                      {/* <Route path="/banquet/categorymenu" element={<CategoryMenu />} /> */}
                    </Routes>
                  </main>
                </div>
              </div>
            </AuthRoute>
          }
        />
      </Routes>
    </AppContextProvider>
  );
};
export default App;
