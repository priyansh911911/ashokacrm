// src/components/cards/DepartmentCard.jsx
import React from "react";
import { Plus } from "lucide-react";

const DepartmentCard = ({
  icon: IconComponent,
  name,
  action,
  taskCount,
  color,
  onClick,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className={`p-2 rounded-lg ${color} text-white`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full">
            {taskCount} Tasks
          </span>
        </div>
        <h3 className="text-sm text-text/70">{name}</h3>
        <div className="flex justify-between items-center mt-1">
          <p className="text-lg font-bold text-[#1f2937]">{action}</p>
          <button
            onClick={onClick}
            className="p-1 rounded-full hover:bg-blue-50 transition-colors"
            aria-label={`Add ${name} task`}
          >
            <Plus className="w-5 h-5 text-black-800" />
          </button>
        </div>
      </div>
      <div className={`h-1 ${color}`}></div>
    </div>
  );
};

export default DepartmentCard;
