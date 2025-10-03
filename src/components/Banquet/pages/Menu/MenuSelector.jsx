
import { useState, useEffect, useMemo } from "react";
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
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  // API functions
  const fetchMenuItems = async () => {
    const response = await axios.get('/api/menu-items');
    return response.data.success ? response.data.data : response.data;
  };

  const createMenuItem = async (itemData) => {
    const response = await axios.post('/api/menu-items', itemData);
    return response.data;
  };

  const deleteMenuItem = async (itemId) => {
    const response = await axios.delete(`/api/menu-items/${itemId}`);
    return response.data;
  };

  const deleteMenuItems = async () => {
    const response = await axios.delete('/api/menu-items');
    return response.data;
  };

  const fetchCategories = async () => {
    const response = await axios.get('/api/banquet-categories/all');
    return response.data;
  };

  const createCategory = async (categoryData) => {
    const response = await axios.post('/api/banquet-categories/create', categoryData);
    return response.data;
  };

  const fetchPlanLimits = async () => {
    const response = await axios.get('/api/plan-limits/get');
    return response.data;
  };

  const createPlanLimits = async (limitsData) => {
    const response = await axios.post('/api/plan-limits', limitsData);
    return response.data;
  };

  // Fetch menu items, categories and plan limits
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        const [menuData, categoriesData, limitsData] = await Promise.all([
          fetchMenuItems(),
          fetchCategories(),
          fetchPlanLimits()
        ]);
        
        console.log('Categories response:', categoriesData);
        console.log('Menu items response:', menuData);
        console.log('Plan limits response:', limitsData);
        
        // Handle categories
        if (categoriesData) {
          const cats = Array.isArray(categoriesData) ? categoriesData : 
                      categoriesData.data ? categoriesData.data : 
                      categoriesData.categories ? categoriesData.categories : [];
          setCategories(cats);
          if (cats.length > 0) {
            setCurrentCategory(cats[0].cateName || cats[0].name);
          }
        }
        
        // Handle menu items
        if (menuData) {
          const items = Array.isArray(menuData) ? menuData :
                       menuData.data ? menuData.data :
                       menuData.items ? menuData.items : [];
          setMenuItems(items);
        }
        
        // Handle plan limits
        if (limitsData) {
          const limits = limitsData.success ? limitsData.data : limitsData;
          setPlanLimits(limits);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error details:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [axios]);

  // Get items for current category filtered by foodType
  const currentCategoryItems = useMemo(() => {
    console.log('Current category:', currentCategory);
    console.log('Food type:', foodType);
    console.log('Menu items:', menuItems);
    
    if (!menuItems.length || !currentCategory) return [];
    
    return menuItems
      .filter(item => {
        console.log('Checking item:', item);
        
        // Filter by category - handle different category formats
        let categoryMatch = false;
        if (item.category) {
          if (typeof item.category === 'string') {
            // Try regex match first
            const match = item.category.match(/cateName:\s*['"]([^'"]+)['"]/);
            if (match && match[1] === currentCategory) {
              categoryMatch = true;
            } else if (item.category === currentCategory) {
              categoryMatch = true;
            }
          } else if (typeof item.category === 'object') {
            categoryMatch = (item.category.cateName || item.category.name) === currentCategory;
          }
        }
        
        if (!categoryMatch) return false;
        
        // Filter by foodType - exact match only
        if (foodType && item.foodType) {
          return item.foodType === foodType;
        }
        
        return true;
      })
      .map(item => item.name || item.itemName);
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

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      await createCategory({ cateName: newCategoryName });
      const updatedCategories = await fetchCategories();
      setCategories(updatedCategories);
      setNewCategoryName("");
      setShowAddCategory(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleDeleteMenuItem = async (itemName) => {
    try {
      const item = menuItems.find(mi => mi.name === itemName);
      if (item && item.id) {
        await deleteMenuItem(item.id);
        const updatedItems = await fetchMenuItems();
        setMenuItems(updatedItems);
        setSelectedItems(prev => prev.filter(i => i !== itemName));
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
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
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-lg">Categories</h4>
              {isAdmin && (
                <button 
                  className="btn btn-xs btn-primary"
                  onClick={() => setShowAddCategory(true)}
                >
                  +
                </button>
              )}
            </div>
            
            {showAddCategory && (
              <div className="mb-4 p-2 bg-base-100 rounded">
                <input
                  type="text"
                  placeholder="Category name"
                  className="input input-xs w-full mb-2"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <div className="flex gap-1">
                  <button 
                    className="btn btn-xs btn-primary"
                    onClick={handleAddCategory}
                  >
                    Add
                  </button>
                  <button 
                    className="btn btn-xs btn-ghost"
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategoryName("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
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
                      <div className="flex items-center justify-between">
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
                        {isAdmin && (
                          <button
                            className="btn btn-xs btn-error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMenuItem(item);
                            }}
                          >
                            ×
                          </button>
                        )}
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
                console.log('Add Selected Items clicked');
                console.log('Selected items:', selectedItems);
                console.log('onSave function:', onSave);
                
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
                  console.log('Categorized menu:', categorizedMenu);
                  onSave(selectedItems, categorizedMenu);
                  onClose();
                } else {
                  console.log('No onSave function provided');
                }
              }}
              disabled={selectedItems.length === 0}
            >
              Add Selected Items ({selectedItems.length})
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MenuSelector;