import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Main axios instance
const mainAxios = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true
});

// Use single axios instance for all requests
const customAxios = {
  get: (url, config) => mainAxios.get(url, config),
  post: (url, data, config) => mainAxios.post(url, data, config),
  put: (url, data, config) => mainAxios.put(url, data, config),
  delete: (url, config) => mainAxios.delete(url, config),
  patch: (url, data, config) => mainAxios.patch(url, data, config)
};

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const AppContextProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only run on mobile
      if (window.innerWidth >= 768) return;

      // Check if sidebar is open
      if (!isSidebarOpen) return;

      // Check if click is outside sidebar
      const sidebar = document.querySelector("aside");
      const hamburger = document.querySelector(
        'button[aria-label="Toggle sidebar"]'
      );

      if (
        sidebar &&
        !sidebar.contains(event.target) &&
        hamburger &&
        !hamburger.contains(event.target)
      ) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const value = {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    axios: customAxios,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
