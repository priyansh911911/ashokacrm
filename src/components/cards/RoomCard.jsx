import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS } from "../dashboardData.js";

const RoomCard = ({
  timeFrame,
  setTimeFrame,
  selectedYear,
  setSelectedYear,
  roomTypeData,
}) => {
  const weeklyData = roomTypeData.weekly;
  const monthlyData = roomTypeData.monthly;
  const yearlyData = roomTypeData.yearly;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Room Availability</h3>
        <div className="space-y-3">
          {["Standard", "Deluxe", "Suite", "Executive"].map((type, i) => (
            <div key={i} className="bg-background p-3 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{type}</span>
                <span>
                  {Math.floor(Math.random() * 10) + 5}/
                  {Math.floor(Math.random() * 20) + 15} Available
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${Math.floor(Math.random() * 70) + 30}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {timeFrame === "weekly"
              ? "Weekly Room Distribution"
              : timeFrame === "monthly"
              ? "Monthly Room Distribution"
              : "Yearly Room Distribution"}
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

export default RoomCard;
