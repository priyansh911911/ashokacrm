
import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { showToast } from "../../utils/toaster";

function App() {
  const { axios } = useAppContext();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicleNumber: "",
    seatingCapacity: "",
    status: "active",
    insuranceValidTill: "",
    registrationExpiry: "",
    remarks: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [singleVehicleFound, setSingleVehicleFound] = useState(null);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    setSingleVehicleFound(null);

    try {
      let response;
      let data;

      const isPotentialId =
        searchQuery.length === 24 && /^[0-9a-fA-F]+$/.test(searchQuery);

      if (isPotentialId) {
        try {
          const { data: vehicleData } = await axios.get(
            `/api/vehicle/get/${searchQuery}`
          );
          const formattedVehicle = {
            ...vehicleData,
            insuranceValidTill: vehicleData.insuranceValidTill
              ? new Date(vehicleData.insuranceValidTill)
                  .toISOString()
                  .split("T")[0]
              : "",
            registrationExpiry: vehicleData.registrationExpiry
              ? new Date(vehicleData.registrationExpiry)
                  .toISOString()
                  .split("T")[0]
              : "",
          };
          setSingleVehicleFound(formattedVehicle);
          setVehicles([]);
          setLoading(false);
          return;
        } catch (idFetchError) {
          console.warn(
            `Vehicle with ID ${searchQuery} not found. Attempting general search.`
          );
        }
      }

      try {
        const { data } = await axios.get("/api/vehicle/all");

        let vehicleData;
        if (
          data &&
          typeof data === "object" &&
          data.vehicles &&
          Array.isArray(data.vehicles)
        ) {
          vehicleData = data.vehicles;
        } else if (!Array.isArray(data)) {
          console.warn(
            "API response for /all was not an array or did not contain a 'vehicles' array:",
            data
          );
          vehicleData = [];
        } else {
          vehicleData = data;
        }

        const formattedData = vehicleData.map((vehicle) => ({
          ...vehicle,
          insuranceValidTill: vehicle.insuranceValidTill
            ? new Date(vehicle.insuranceValidTill).toISOString().split("T")[0]
            : "",
          registrationExpiry: vehicle.registrationExpiry
            ? new Date(vehicle.registrationExpiry).toISOString().split("T")[0]
            : "",
        }));
        setVehicles(formattedData);
      } catch (fetchError) {
        console.error("Error fetching vehicles:", fetchError);
        setError(`Failed to load vehicles: ${fetchError.message}`);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(`Failed to load vehicles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [searchQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError(null);

    try {
      const vehicleData = {
        vehicleNumber: formData.vehicleNumber,
        seatingCapacity: parseInt(formData.seatingCapacity) || 0,
        status: formData.status,
        insuranceValidTill: formData.insuranceValidTill
          ? new Date(formData.insuranceValidTill).toISOString()
          : null,
        registrationExpiry: formData.registrationExpiry
          ? new Date(formData.registrationExpiry).toISOString()
          : null,
        remarks: formData.remarks,
      };

      let response;
      let url;

      if (editingVehicle) {
        await axios.put(
          `/api/vehicle/update/${editingVehicle._id}`,
          vehicleData
        );
      } else {
        await axios.post("/api/vehicle/add", vehicleData);
      }

      setMessage(
        `Vehicle ${editingVehicle ? "updated" : "added"} successfully!`
      );
      resetForm();
      fetchVehicles();
      showToast.success(`✅ Vehicle ${editingVehicle ? "updated" : "added"} successfully!`);
    } catch (err) {
      console.error("Error saving vehicle:", err);
      setError(`Failed to save vehicle: ${err.message}`);
      showToast.error(`Failed to save vehicle: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleNumber: vehicle.vehicleNumber,
      seatingCapacity: vehicle.seatingCapacity,
      status: vehicle.status,
      insuranceValidTill: vehicle.insuranceValidTill
        ? new Date(vehicle.insuranceValidTill).toISOString().split("T")[0]
        : "",
      registrationExpiry: vehicle.registrationExpiry
        ? new Date(vehicle.registrationExpiry).toISOString().split("T")[0]
        : "",
      remarks: vehicle.remarks,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      setLoading(true);
      setMessage("");
      setError(null);
      try {
        await axios.delete(`/api/vehicle/delete/${id}`);
        setMessage("Vehicle deleted successfully!");

        fetchVehicles();
        showToast.success('🗑️ Vehicle deleted successfully!');
      } catch (err) {
        console.error("Error deleting vehicle:", err);
        setError(`Failed to delete vehicle: ${err.message}`);
        showToast.error(`Failed to delete vehicle: ${err.message}`);
      } finally {
        setLoading(false);
        setTimeout(() => setMessage(""), 3000);
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const resetForm = () => {
    setEditingVehicle(null);
    setFormData({
      vehicleNumber: "",
      seatingCapacity: "",
      status: "active",
      insuranceValidTill: "",
      registrationExpiry: "",
      remarks: "",
    });
    setIsFormOpen(false);
  };

  const handleModalClick = (e) => {
    if (e.target.id === "vehicle-form-modal-overlay") {
      resetForm();
    }
  };

  const vehiclesToDisplay = singleVehicleFound
    ? [singleVehicleFound]
    : vehicles.filter((vehicle) => {
        const matchesSearch =
          searchQuery === "" ||
          vehicle.vehicleNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesStatus =
          filterStatus === "all" || vehicle.status === filterStatus;

        return matchesSearch && matchesStatus;
      });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans" style={{ backgroundColor: 'hsl(45, 100%, 95%)' }}>
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6" style={{ borderColor: 'hsl(45, 100%, 85%)' }}>
        <h1 className="text-3xl font-bold text-center mb-6" style={{ color: 'hsl(45, 100%, 20%)' }}>
          Vehicle Management
        </h1>

        {message && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{message}</span>
          </div>
        )}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-full sm:w-auto font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            style={{ backgroundColor: 'hsl(45, 43%, 58%)', color: 'hsl(45, 100%, 20%)' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 32%, 46%)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'hsl(45, 43%, 58%)'}
          >
            Add New Vehicle
          </button>

          <input
            type="text"
            placeholder="Search by number or ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="w-full sm:w-1/2 p-2 border rounded-lg shadow-sm"
            style={{ borderColor: 'hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)' }}
            onFocus={(e) => e.target.style.borderColor = 'hsl(45, 43%, 58%)'}
            onBlur={(e) => e.target.style.borderColor = 'hsl(45, 100%, 85%)'}
          />

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setSearchQuery("");
            }}
            className="w-full sm:w-auto p-2 border rounded-lg shadow-sm"
            style={{ borderColor: 'hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)' }}
            onFocus={(e) => e.target.style.borderColor = 'hsl(45, 43%, 58%)'}
            onBlur={(e) => e.target.style.borderColor = 'hsl(45, 100%, 85%)'}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="under_maintenance">Under Maintenance</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="ml-3 text-gray-700">Loading data...</p>
          </div>
        )}

        {!loading && (
          <div className="overflow-x-auto rounded-lg shadow-md border" style={{ borderColor: 'hsl(45, 100%, 85%)' }}>
            <table className="min-w-full divide-y" style={{ borderColor: 'hsl(45, 100%, 85%)' }}>
              <thead style={{ backgroundColor: 'hsl(45, 100%, 95%)' }}>
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'hsl(45, 100%, 20%)' }}
                  >
                    Vehicle No.
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'hsl(45, 100%, 20%)' }}
                  >
                    Capacity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'hsl(45, 100%, 20%)' }}
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'hsl(45, 100%, 20%)' }}
                  >
                    Insurance Expiry
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'hsl(45, 100%, 20%)' }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y" style={{ borderColor: 'hsl(45, 100%, 85%)' }}>
                {vehiclesToDisplay.length > 0 ? (
                  vehiclesToDisplay.map((vehicle) => (
                    <tr key={vehicle._id} className="hover:bg-gray-50" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(45, 100%, 95%)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                      <td className="px-6 py-3 text-sm font-medium" style={{ color: 'hsl(45, 100%, 20%)' }}>
                        {vehicle.vehicleNumber}
                      </td>
                      <td className="px-6 py-3 text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>
                        {vehicle.seatingCapacity}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            vehicle.status === "active"
                              ? "bg-green-100 text-green-800"
                              : vehicle.status === "under_maintenance"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          } capitalize`}
                        >
                          {vehicle.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>
                        {vehicle.insuranceValidTill || "N/A"}
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="transition duration-150 ease-in-out"
                          style={{ color: 'hsl(45, 43%, 58%)' }}
                          onMouseEnter={(e) => e.target.style.color = 'hsl(45, 32%, 46%)'}
                          onMouseLeave={(e) => e.target.style.color = 'hsl(45, 43%, 58%)'}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle._id)}
                          className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-3 text-center text-sm"
                      style={{ color: 'hsl(45, 100%, 20%)' }}
                    >
                      {searchQuery.trim() && !loading && !singleVehicleFound
                        ? "No vehicle found with this ID or number."
                        : "No vehicles found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {isFormOpen && (
          <div
            id="vehicle-form-modal-overlay"
            className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            onClick={handleModalClick}
          >
            <style>
              {`
              /* For WebKit browsers (Chrome, Safari) */
              .hide-scrollbar::-webkit-scrollbar {
                  display: none;
              }

              /* For Firefox */
              .hide-scrollbar {
                  scrollbar-width: none; /* Firefox */
              }
              `}
            </style>
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 animate-fade-in hide-scrollbar">
              <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'hsl(45, 100%, 20%)' }}>
                {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label
                    htmlFor="vehicleNumber"
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'hsl(45, 100%, 20%)' }}
                  >
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    id="vehicleNumber"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm"
                    style={{ borderColor: 'hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)' }}
                    onFocus={(e) => e.target.style.borderColor = 'hsl(45, 43%, 58%)'}
                    onBlur={(e) => e.target.style.borderColor = 'hsl(45, 100%, 85%)'}
                  />
                </div>

                <div>
                  <label
                    htmlFor="seatingCapacity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    id="seatingCapacity"
                    name="seatingCapacity"
                    value={formData.seatingCapacity}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="under_maintenance">Under Maintenance</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="insuranceValidTill"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Insurance Valid Till
                  </label>
                  <input
                    type="date"
                    id="insuranceValidTill"
                    name="insuranceValidTill"
                    value={formData.insuranceValidTill}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="registrationExpiry"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Registration Expiry
                  </label>
                  <input
                    type="date"
                    id="registrationExpiry"
                    name="registrationExpiry"
                    value={formData.registrationExpiry}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="remarks"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Remarks
                  </label>
                  <textarea
                    id="remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150 ease-in-out"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                    style={{ backgroundColor: 'hsl(45, 43%, 58%)', color: 'hsl(45, 100%, 20%)' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 32%, 46%)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'hsl(45, 43%, 58%)'}
                  >
                    {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
