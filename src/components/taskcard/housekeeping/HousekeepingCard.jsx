import React from "react";
import { Home } from "lucide-react";
import DepartmentCard from "../DepartmentCard";

const HousekeepingCard = ({ taskCount, onClick }) => {
  return (
    <DepartmentCard
      icon={Home}
      name="Housekeeping"
      action="Clean Rooms"
      taskCount={taskCount}
      color="bg-primary"
      onClick={onClick}
    />
  );
};

export default HousekeepingCard;
