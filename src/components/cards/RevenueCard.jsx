import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const RevenueCard = ({
  timeFrame,
  setTimeFrame,
  selectedYear,
  setSelectedYear,
  revenueData,
}) => {
  const weeklyData = revenueData.weekly;
  const monthlyData = revenueData.monthly;
  const yearlyData = revenueData.yearly;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
        <div className="space-y-3">
          <div className="bg-background p-3 rounded-lg flex justify-between">
            <span>Room Revenue</span>
            <span className="font-semibold">₹28,450</span>
          </div>
          <div className="bg-background p-3 rounded-lg flex justify-between">
            <span>F&B Revenue</span>
            <span className="font-semibold">₹3,200</span>
          </div>
          <div className="bg-background p-3 rounded-lg flex justify-between">
            <span>Additional Services</span>
            <span className="font-semibold">₹800</span>
          </div>
          <div className="bg-accent p-3 rounded-lg flex justify-between">
            <span className="font-semibold">Total Revenue</span>
            <span className="font-semibold">₹32,450</span>
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {timeFrame === "weekly"
              ? "Weekly Revenue"
              : timeFrame === "monthly"
              ? "Monthly Revenue"
              : "Yearly Revenue"}
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
                <option value={2026}>2026</option>
              </select>
            )}
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={
                timeFrame === "weekly"
                  ? weeklyData
                  : timeFrame === "monthly"
                  ? monthlyData
                  : yearlyData.filter((item) => item.year === selectedYear)
              }
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
              <Bar dataKey="value" fill="#e11d48" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RevenueCard;
