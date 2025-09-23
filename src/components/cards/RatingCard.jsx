import React from "react";
import { Star } from "lucide-react";

const RatingCard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
        <div className="space-y-3">
          <div className="bg-background p-3 rounded-lg">
            <div className="flex justify-between mb-1">
              <span>Room Quality</span>
              <span className="flex items-center">
                <Star className="w-4 h-4 fill-primary text-primary mr-1" />
                <span>4.9</span>
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: "98%" }}
              ></div>
            </div>
          </div>
          <div className="bg-background p-3 rounded-lg">
            <div className="flex justify-between mb-1">
              <span>Service</span>
              <span className="flex items-center">
                <Star className="w-4 h-4 fill-primary text-primary mr-1" />
                <span>4.8</span>
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: "96%" }}
              ></div>
            </div>
          </div>
          <div className="bg-background p-3 rounded-lg">
            <div className="flex justify-between mb-1">
              <span>Cleanliness</span>
              <span className="flex items-center">
                <Star className="w-4 h-4 fill-primary text-primary mr-1" />
                <span>4.7</span>
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: "94%" }}
              ></div>
            </div>
          </div>
          <div className="bg-background p-3 rounded-lg">
            <div className="flex justify-between mb-1">
              <span>Value for Money</span>
              <span className="flex items-center">
                <Star className="w-4 h-4 fill-primary text-primary mr-1" />
                <span>4.6</span>
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: "92%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-background p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="font-medium">Guest #{i}</span>
                <span className="flex items-center">
                  {Array(5)
                    .fill(0)
                    .map((_, j) => (
                      <Star
                        key={j}
                        className={`w-3 h-3 ${
                          j < 5 - i / 2
                            ? "fill-primary text-primary"
                            : "text-gray-300"
                        } mr-0.5`}
                      />
                    ))}
                </span>
              </div>
              <div className="text-sm text-text/70 mt-1">
                "Excellent stay, would recommend to others!"
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingCard;
