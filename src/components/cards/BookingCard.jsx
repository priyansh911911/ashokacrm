import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS } from "../dashboardData.js";

const BookingCard = ({
  timeFrame,
  setTimeFrame,
  selectedYear,
  setSelectedYear,
  bookingSourceData,
}) => {
  const weeklyData = bookingSourceData.weekly;
  const monthlyData = bookingSourceData.monthly;
  const yearlyData = bookingSourceData.yearly;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-background p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">Guest #{i}</span>
                <span
                  className={
                    i === 1 ? "text-red-600 font-medium" : "text-primary"
                  }
                >
                  {i === 1 ? "Pending" : "Confirmed"}
                </span>
              </div>
              <div className="text-sm text-text/70 mt-1">
                Check-in: {i === 1 ? "Today" : i === 2 ? "Tomorrow" : "Jul 15"}{" "}
                • {i + 1} nights • {["Deluxe", "Standard", "Suite"][i - 1]} Room
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {timeFrame === "weekly"
              ? "Weekly Booking Sources"
              : timeFrame === "monthly"
              ? "Monthly Booking Sources"
              : "Yearly Booking Sources"}
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex bg-background rounded-lg overflow-hidden">
              <button
                onClick={() => setTimeFrame("weekly")}
                className={`px-3 py-1 text-xs font-medium ${
                  timeFrame === "weekly"
                    ? "bg-primary text-white"
                    : "bg-background text-text hover:bg-border"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeFrame("monthly")}
                className={`px-3 py-1 text-xs font-medium ${
                  timeFrame === "monthly"
                    ? "bg-primary text-white"
                    : "bg-background text-text hover:bg-border"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeFrame("yearly")}
                className={`px-3 py-1 text-xs font-medium ${
                  timeFrame === "yearly"
                    ? "bg-primary text-white"
                    : "bg-background text-text hover:bg-border"
                }`}
              >
                Yearly
              </button>
            </div>

            {timeFrame === "yearly" && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-2 py-1 text-xs rounded-lg bg-background"
              >
                <option value={2023}>2023</option>
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            )}
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={
                  timeFrame === "weekly"
                    ? weeklyData
                    : timeFrame === "monthly"
                    ? monthlyData
                    : yearlyData[selectedYear]
                }
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {(timeFrame === "weekly"
                  ? weeklyData
                  : timeFrame === "monthly"
                  ? monthlyData
                  : yearlyData[selectedYear]
                ).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
