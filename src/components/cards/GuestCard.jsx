import React from "react";

const GuestCard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Guest Status</h3>
        <div className="space-y-3">
          <div className="bg-background p-3 rounded-lg flex justify-between">
            <span>Currently In-House</span>
            <span className="font-semibold">58</span>
          </div>
          <div className="bg-background p-3 rounded-lg flex justify-between">
            <span>Arriving Today</span>
            <span className="font-semibold text-red-600">12</span>
          </div>
          <div className="bg-background p-3 rounded-lg flex justify-between">
            <span>Departing Today</span>
            <span className="font-semibold">8</span>
          </div>
          <div className="bg-background p-3 rounded-lg flex justify-between">
            <span>VIP Guests</span>
            <span className="font-semibold">3</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Upcoming Arrivals</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-background p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">Guest #{i}</span>
                <span className={i === 1 ? "text-red-600 font-medium" : ""}>
                  {i === 1 || i === 2 ? "Today" : "Tomorrow"}
                </span>
              </div>
              <div className="text-sm text-text/70 mt-1">
                {i === 3 ? "VIP Guest • " : ""}
                {["Deluxe", "Standard", "Suite", "Executive"][i - 1]} Room
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuestCard;
