import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const OccupancyCard = ({
  timeFrame,
  setTimeFrame,
  selectedYear,
  setSelectedYear,
  occupancyData,
}) => {
  const weeklyData = occupancyData.weekly;
  const monthlyData = occupancyData.monthly;
  const yearlyData = occupancyData.yearly;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Occupancy Stats</h3>
        <div className="space-y-3">
          <div className="bg-background p-3 rounded-lg flex justify-between">
            <span>Current Occupancy</span>
            <span className="font-semibold">78%</span>
          </div>
          <div className="bg-background p-3 rounded-lg flex justify-between">
            <span>Last Week Average</span>
            <span className="font-semibold">75%</span>
          </div>
          <div className="bg-background p-3 rounded-lg flex justify-between">
            <span>Last Month Average</span>
            <span className="font-semibold">72%</span>
          </div>
          <div className="bg-background p-3 rounded-lg flex justify-between">
            <span>Year to Date</span>
            <span className="font-semibold">68%</span>
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {timeFrame === "weekly"
              ? "Weekly Occupancy"
              : timeFrame === "monthly"
              ? "Monthly Occupancy"
              : "Yearly Occupancy"}
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
            <LineChart
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
              <Tooltip formatter={(value) => [`${value}%`, "Occupancy"]} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#e11d48"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default OccupancyCard;
