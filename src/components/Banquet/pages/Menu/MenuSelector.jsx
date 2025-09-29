import { useState } from "react";
import Veg from "../json/Veg.json";
import NonVeg from "../json/Non_veg.json";
import RatePlanLimits from "../json/RatePlanLimits.json";

const MenuSelector = ({ onSave, onClose, initialItems = [], foodType = "Veg", ratePlan = "Silver" }) => {
  const [selectedItems, setSelectedItems] = useState(initialItems);
  const menuData = foodType === "Non-Veg" ? NonVeg : Veg;
  const [activeCategory, setActiveCategory] = useState(menuData.categories[0]?.name || "");
  
  const isAdmin = localStorage.getItem('role') === 'Admin';
  const limits = RatePlanLimits[ratePlan]?.[foodType] || {};

  const getCategoryCount = (categoryName) => {
    return selectedItems.filter(item => {
      const category = menuData.categories.find(cat => cat.items.includes(item));
      return category?.name === categoryName;
    }).length;
  };

  const canSelectMore = (categoryName) => {
    if (isAdmin) return true;
    const currentCount = getCategoryCount(categoryName);
    const limit = limits[categoryName] || 0;
    return currentCount < limit;
  };

  const handleItemToggle = (item) => {
    const category = menuData.categories.find(cat => cat.items.includes(item));
    if (!category) return;

    const isSelected = selectedItems.includes(item);
    
    if (!isSelected && !canSelectMore(category.name)) {
      return;
    }

    const newItems = isSelected 
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item];
    
    setSelectedItems(newItems);
    
    // Convert to category format matching your database schema
    const categorizedMenu = {
      WELCOME_DRINKS: [],
      STARTER_VEG: [],
      SALAD: [],
      RAITA: [],
      MAIN_COURSE_PANEER: [],
      MAIN_COURSE: [],
      VEGETABLES: [],
      DAL: [],
      RICE: [],
      BREADS: [],
      DESSERTS: []
    };
    
    newItems.forEach(item => {
      const cat = menuData.categories.find(c => c.items.includes(item));
      if (cat) {
        // Direct mapping - category names in JSON match database schema
        if (categorizedMenu[cat.name] !== undefined) {
          categorizedMenu[cat.name].push(item);
        }
      }
    });
    
    onSave?.(newItems, categorizedMenu);
  };

  const activeItems = menuData.categories.find(cat => cat.name === activeCategory)?.items || [];

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl h-[92vh] flex flex-col relative shadow-2xl border border-white/20 bg-white dark:bg-base-200 !p-0 overflow-hidden">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 z-20 bg-white/70 hover:bg-white/90 shadow"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="flex flex-1 h-full">
          <aside className="w-80 bg-white/40 dark:bg-base-200/60 border-r border-white/20 flex flex-col gap-1 py-6 px-2 overflow-y-auto">
            <h4 className="font-bold text-lg mb-2 text-center">Categories</h4>
            {menuData.categories.map((category) => {
              const count = getCategoryCount(category.name);
              const limit = limits[category.name] || 0;
              const icons = {
                WELCOME_DRINKS: "🥤", STARTER_VEG: "🥗", SALAD: "🥗", RAITA: "🥛",
                MAIN_COURSE_PANEER: "🧀", MAIN_COURSE: "🍖", VEGETABLES: "🥦", 
                DAL: "🍛", RICE: "🍚", BREADS: "🥖", DESSERTS: "🍰"
              };
              const icon = icons[category.name] || "🍽️";
              
              return (
                <button
                  key={category.name}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-all text-left font-medium shadow-sm border border-transparent hover:bg-primary/10 focus:bg-primary/20 focus:outline-none ${
                    activeCategory === category.name ? "bg-primary text-primary-content border-primary" : "bg-white/60 dark:bg-base-100/60"
                  }`}
                  onClick={() => setActiveCategory(category.name)}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="flex-1 truncate">{category.name}</span>
                  <span className="badge badge-info badge-sm font-bold">
                    {isAdmin ? `${count}` : `${count}/${limit}`}
                  </span>
                </button>
              );
            })}
          </aside>

          <main className="flex-1 flex flex-col h-full">
            <div className="px-6 pt-8 pb-2">
              <h3 className="font-bold text-2xl text-center mb-2 tracking-tight drop-shadow">
                {ratePlan ? `${ratePlan} ${foodType} Menu Selection` : 'Menu Selection'}
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {activeItems.map(item => {
                  const isSelected = selectedItems.includes(item);
                  const category = menuData.categories.find(cat => cat.items.includes(item));
                  const canSelect = isSelected || canSelectMore(category?.name);
                  
                  return (
                    <div
                      key={item}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-content"
                          : canSelect
                          ? "bg-base-200 hover:bg-base-300"
                          : "bg-base-200 opacity-50 cursor-not-allowed"
                      }`}
                      onClick={() => canSelect && handleItemToggle(item)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="checkbox checkbox-sm checkbox-primary"
                          disabled={!canSelect}
                        />
                        <span>{item}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <footer className="sticky bottom-0 left-0 w-full bg-white/80 dark:bg-base-200/90 border-t border-white/20 px-6 py-4 flex justify-center items-center z-10 shadow-lg backdrop-blur">
              <button
                className="btn btn-ghost"
                onClick={onClose}
              >
                Close Menu Selector
              </button>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MenuSelector;