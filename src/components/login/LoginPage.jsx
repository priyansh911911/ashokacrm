import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { showToast } from "../../utils/toaster";
import { validateRequired, validateMinLength } from "../../utils/validation";
import backgroundImage from "../../assets/9e5a6b521cd43319c86acf395f110951.jpg";
import logoImage from "../../assets/buddhaavenuelogo.png";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { axios } = useAppContext();

  // In LoginPage.jsx
  // In LoginPage.jsx, update the handleSubmit function:
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!validateRequired(username)) {
      setError('Username is required');
      showToast.error('Username is required');
      return;
    }
    
    if (!validateRequired(password)) {
      setError('Password is required');
      showToast.error('Password is required');
      return;
    }
    
    if (!validateMinLength(password, 6)) {
      setError('Password must be at least 6 characters');
      showToast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "/api/auth/login",
        {
          username,
          password,
        }
      );

      // Store auth data in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("userId", response.data.userId); // Add this line
      localStorage.setItem(
        "department",
        JSON.stringify(response.data.department)
      );

      // Always redirect to dashboard after login
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/30"></div>

      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden relative z-10">
        <div className="bg-primary py-2 ">
          <div className="text-center">
            <img src={logoImage} alt="Buddha Avenue" className="h-25 mx-auto" />{" "}
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-semibold text-text mb-6">Login</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-text mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Admin123"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-hover text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-text">
            <a href="#" className="text-primary hover:text-hover">
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
