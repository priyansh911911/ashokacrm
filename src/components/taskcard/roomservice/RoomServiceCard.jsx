// src/components/departments/RoomServiceCard.jsx
import React from "react";
import { Coffee } from "lucide-react";
import DepartmentCard from "../DepartmentCard.jsx";

const RoomServiceCard = ({ taskCount, onClick }) => {
  return (
    <DepartmentCard
      icon={Coffee}
      name="Room Service"
      action="Deliver Orders"
      taskCount={taskCount}
      color="bg-primary"
      onClick={onClick}
    />
  );
};

export default RoomServiceCard;
