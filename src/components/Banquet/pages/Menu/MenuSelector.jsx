import { useState, useEffect, useMemo } from "react";
import { useMenuData, usePlanLimits } from "../../hooks/useMenuData";
import { useAppContext } from "../../../../context/AppContext";

const MenuSelector = ({
  onSave,
  onSaveCategory,
  onClose,
  initialItems,
  foodType,
  ratePlan
}) => {
  const isAdmin = (localStorage.getItem('role') === 'Admin');
  const { axios } = useAppContext();
  
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState(initialItems || []);
  const [currentCategory, setCurrentCategory] = useState("");
  const [planLimits, setPlanLimits] = useState({});

  // Fetch menu items, categories and plan limits
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, categoriesRes, limitsRes] = await Promise.all([
          axios.get('/api/menu-items'),
          axios.get('https://backend-hazel-xi.vercel.app/api/banquet-categories/all'),
          axios.get('https://backend-hazel-xi.vercel.app/api/plan-limits/get')
        ]);
        
        const menuData = menuRes.data.success ? menuRes.data.data : menuRes.data;
        const categoriesData = categoriesRes.data;
        const limitsData = limitsRes.data;
        
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
          if (categoriesData.length > 0) {
            setCurrentCategory(categoriesData[0].cateName || categoriesData[0].name);
          }
        }
        
        if (Array.isArray(menuData)) {
          setMenuItems(menuData);
        }
        
        if (limitsData) {
          console.log('Plan Limits Data:', limitsData);
          const limits = limitsData.success ? limitsData.data : limitsData;
          setPlanLimits(limits);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [axios]);

  // Get items for current category filtered by foodType
  const currentCategoryItems = useMemo(() => {
    if (!menuItems.length || !currentCategory) return [];
    
    return menuItems
      .filter(item => {
        // Filter by category
        if (item.category && typeof item.category === 'string') {
          const match = item.category.match(/cateName:\s*['"]([^'"]+)['"]/);
          if (!match || match[1] !== currentCategory) return false;
        } else {
          return false;
        }
        
        // Filter by foodType - exact match only
        if (foodType && item.foodType) {
          return item.foodType === foodType;
        }
        
        return true;
      })
      .map(item => item.name);
  }, [menuItems, currentCategory, foodType]);

  const handleSelectItem = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.includes(item);
      if (isSelected) {
        return prev.filter(i => i !== item);
      }
      
      // Find matching plan limit based on foodType and ratePlan
      const matchingPlan = Array.isArray(planLimits) 
        ? planLimits.find(plan => plan.foodType === foodType && plan.ratePlan === ratePlan)
        : null;
      
      const categoryLimit = matchingPlan?.limits?.[currentCategory];
      
      console.log('Matching Plan:', matchingPlan);
      console.log('Current Category:', currentCategory);
      console.log('Category Limit:', categoryLimit);
      
      if (categoryLimit) {
        const currentCategorySelectedCount = prev.filter(selectedItem => {
          const selectedItemData = menuItems.find(mi => mi.name === selectedItem);
          if (selectedItemData?.category && typeof selectedItemData.category === 'string') {
            const match = selectedItemData.category.match(/cateName:\s*['"]([^'"]+)['"]/);
            return match && match[1] === currentCategory;
          }
          return false;
        }).length;
        
        console.log('Current selected count for category:', currentCategorySelectedCount);
        
        if (currentCategorySelectedCount >= categoryLimit) {
          return prev;
        }
      }
      
      return [...prev, item];
    });
  };

  if (loading) {
    return (
      <div className="modal modal-open">
        <div className="modal-box max-w-6xl h-[92vh] flex items-center justify-center">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-6xl h-[92vh] flex flex-col">
        <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4" onClick={onClose}>✕</button>
        
        <div className="flex flex-1 h-full">
          {/* Categories Sidebar */}
          <aside className="w-[300px] bg-base-200 p-4 overflow-y-auto">
            <h4 className="font-bold text-lg mb-4">Categories</h4>
            {categories.length === 0 ? (
              <div className="text-center text-gray-500">No categories found</div>
            ) : (
              categories.map((category) => (
                <button
                  key={category.cateName || category.name}
                  className={`w-full p-3 mb-2 rounded-lg text-left ${
                    currentCategory === (category.cateName || category.name)
                      ? "bg-primary text-primary-content" 
                      : "bg-base-100 hover:bg-base-300"
                  }`}
                  onClick={() => setCurrentCategory(category.cateName || category.name)}
                >
                  <div>{category.cateName || category.name}</div>
                  {(() => {
                    const matchingPlan = Array.isArray(planLimits) 
                      ? planLimits.find(plan => plan.foodType === foodType && plan.ratePlan === ratePlan)
                      : null;
                    const categoryName = category.cateName || category.name;
                    const limit = matchingPlan?.limits?.[categoryName];
                    return limit ? (
                      <div className="text-xs opacity-75">
                        Limit: {limit}
                      </div>
                    ) : null;
                  })()}
                </button>
              ))
            )}
          </aside>

          {/* Items Content */}
          <main className="flex-1 p-6">
            <h3 className="font-bold text-2xl mb-4">{ratePlan} {foodType} Menu Selection</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentCategoryItems.length === 0 ? (
                <div className="text-center text-gray-500 col-span-full">
                  {foodType ? `No ${foodType} items found for this category` : 'No items found for this category'}
                </div>
              ) : (
                currentCategoryItems.map(item => {
                  const isSelected = selectedItems.includes(item);
                  
                  // Check if limit reached for this category
                  const matchingPlan = Array.isArray(planLimits) 
                    ? planLimits.find(plan => plan.foodType === foodType && plan.ratePlan === ratePlan)
                    : null;
                  const categoryLimit = matchingPlan?.limits?.[currentCategory];
                  const currentCategorySelectedCount = selectedItems.filter(selectedItem => {
                    const selectedItemData = menuItems.find(mi => mi.name === selectedItem);
                    if (selectedItemData?.category && typeof selectedItemData.category === 'string') {
                      const match = selectedItemData.category.match(/cateName:\s*['"]([^'"]+)['"]/);
                      return match && match[1] === currentCategory;
                    }
                    return false;
                  }).length;
                  
                  const isLimitReached = categoryLimit && currentCategorySelectedCount >= categoryLimit && !isSelected;
                  
                  return (
                    <div
                      key={item}
                      className={`p-3 rounded-lg transition-colors ${
                        isLimitReached 
                          ? "bg-gray-300 cursor-not-allowed opacity-50" 
                          : isSelected 
                          ? "bg-primary text-primary-content cursor-pointer" 
                          : "bg-base-200 hover:bg-base-300 cursor-pointer"
                      }`}
                      onClick={() => !isLimitReached && handleSelectItem(item)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          disabled={isLimitReached}
                          className="checkbox checkbox-sm"
                        />
                        <span className={isLimitReached ? "text-gray-500" : ""}>{item}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>
        </div>
        
        <footer className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Selected: {selectedItems.length} items
            {(() => {
              const matchingPlan = Array.isArray(planLimits) 
                ? planLimits.find(plan => plan.foodType === foodType && plan.ratePlan === ratePlan)
                : null;
              const limit = matchingPlan?.limits?.[currentCategory];
              if (limit) {
                const currentCount = selectedItems.filter(item => {
                  const itemData = menuItems.find(mi => mi.name === item);
                  if (itemData?.category && typeof itemData.category === 'string') {
                    const match = itemData.category.match(/cateName:\s*['"]([^'"]+)['"]/);
                    return match && match[1] === currentCategory;
                  }
                  return false;
                }).length;
                return (
                  <div className="text-xs">
                    {currentCategory}: {currentCount}/{limit}
                  </div>
                );
              }
              return null;
            })()}
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                if (onSave) {
                  // Create categorized menu from selected items
                  const categorizedMenu = {};
                  selectedItems.forEach(item => {
                    const itemData = menuItems.find(mi => mi.name === item);
                    if (itemData?.category && typeof itemData.category === 'string') {
                      const match = itemData.category.match(/cateName:\s*['"]([^'"]+)['"]/);
                      if (match) {
                        const categoryName = match[1];
                        if (!categorizedMenu[categoryName]) {
                          categorizedMenu[categoryName] = [];
                        }
                        categorizedMenu[categoryName].push(item);
                      }
                    }
                  });
                  onSave(selectedItems, categorizedMenu);
                }
              }}
              disabled={selectedItems.length === 0}
            >
              Add Selected Items
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MenuSelector;