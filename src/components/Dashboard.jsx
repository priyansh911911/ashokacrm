import React, { useState } from "react";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { SlCalender } from "react-icons/sl";
import {
  Calendar,
  Users,
  Home,
  PlusCircle,
  Percent,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import BookingCalendar from "./BookingCalendar";
import BookingCard from "./cards/BookingCard.jsx";
import RoomCard from "./cards/RoomCard.jsx";
import RevenueCard from "./cards/RevenueCard.jsx";
import OccupancyCard from "./cards/OccupancyCard.jsx";
import GuestCard from "./cards/GuestCard.jsx";
import RatingCard from "./cards/RatingCard.jsx";
import QuickActions from "./cards/QuickActions.jsx";
import {
  dashboardCards,
  revenueData,
  occupancyData,
  bookingSourceData,
  roomTypeData,
} from "../components/dashboardData.js";

const Dashboard = () => {
  const [activeCard, setActiveCard] = useState(() => {
    const savedCard = localStorage.getItem("activeCard");
    return savedCard || "bookings"; // Default to "bookings"
  });
  const [timeFrame, setTimeFrame] = useState("weekly");
  const [showCalendar, setShowCalendar] = useState(false);
  const handleCalendarClick = () => {
    setShowCalendar(true);
  };
  const [selectedYear, setSelectedYear] = useState(2025);

  const toggleCard = (cardId) => {
    const newActiveCard = activeCard === cardId ? null : cardId;
    setActiveCard(newActiveCard);
    if (newActiveCard) {
      localStorage.setItem("activeCard", newActiveCard);
    } else {
      localStorage.removeItem("activeCard");
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "Calendar":
        return Calendar;
      case "Home":
        return Home;
      case "FaIndianRupeeSign":
        return FaIndianRupeeSign;
      case "Percent":
        return Percent;
      case "Users":
        return Users;
      case "Star":
        return Star;
      default:
        return null;
    }
  };

  // Card detail content based on active card
  const renderCardDetail = () => {
    switch (activeCard) {
      case "bookings":
        return (
          <BookingCard
            timeFrame={timeFrame}
            setTimeFrame={setTimeFrame}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            bookingSourceData={bookingSourceData}
          />
        );
      case "rooms":
        return (
          <RoomCard
            timeFrame={timeFrame}
            setTimeFrame={setTimeFrame}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            roomTypeData={roomTypeData}
          />
        );

      case "revenue":
        return (
          <RevenueCard
            timeFrame={timeFrame}
            setTimeFrame={setTimeFrame}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            revenueData={revenueData}
          />
        );
      case "occupancy":
        return (
          <OccupancyCard
            timeFrame={timeFrame}
            setTimeFrame={setTimeFrame}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            occupancyData={occupancyData}
          />
        );
      case "guests":
        return <GuestCard />;
      case "rating":
        return <RatingCard />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 overflow-auto h-full bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 mt-4 sm:mt-6 gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1f2937]">
          BUDDHA AVENUE DASHBOARD
        </h1>
        <button
          onClick={handleCalendarClick}
          className="p-2 rounded-full hover:bg-background transition-colors self-end sm:self-auto"
        >
          <SlCalender className="w-6 sm:w-8 h-6 sm:h-8 text-primary hover:bg-primary hover:text-white" />
        </button>
      </div>
      {/* Status Summary */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm">12 Check-ins Today</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-primary mr-2" />
            <span className="text-sm">8 Check-outs Today</span>
          </div>
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-sm">3 Rooms Need Maintenance</span>
          </div>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {dashboardCards.map((card) => {
          const IconComponent = getIcon(card.icon);
          return (
            <div
              key={card.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
                activeCard === card.id
                  ? "ring-2 ring-red-500"
                  : "hover:shadow-lg"
              }`}
              onClick={() => toggleCard(card.id)}
            >
              <div className="p-4 cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <div className={`p-2 rounded-lg ${card.color} text-white`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      card.trendUp ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {card.trend}
                  </span>
                </div>
                <h3 className="text-sm text-text/70">{card.title}</h3>
                <p className="text-2xl font-bold text-[#1f2937]">
                  {card.value}
                </p>
              </div>
              <div
                className={`h-1 ${
                  activeCard === card.id ? "bg-red-500" : card.color
                }`}
              ></div>
            </div>
          );
        })}
      </div>
      {/* Detail Section */}
      {activeCard && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1f2937]">
              {dashboardCards.find((c) => c.id === activeCard)?.title} Details
            </h2>
          </div>
          {renderCardDetail()}
        </div>
      )}
      {/* Quick Actions */}
      <QuickActions />
      {/* Add this at the very end, just before the final closing </div> */}
      <BookingCalendar
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
      />
    </div>
  );
};

export default Dashboard;
