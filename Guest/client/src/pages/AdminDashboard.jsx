import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../utils/axios";
import Sidebar from "../components/Sidebar";
const AdminDashboard = () => {
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Function to fetch guests
  const fetchGuests = async () => {
    try {
      const response = await api.get("/guests");
      setGuests(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching guests");
      console.error("Error:", error);
      setLoading(false);
    }
  };

  // Initial fetch and setup polling
  useEffect(() => {
    fetchGuests();

    // Set up polling every 3 seconds
    const pollInterval = setInterval(fetchGuests, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
  }, []);

  const handleTimeOut = async (guestId) => {
    try {
      await api.put(`/guests/${guestId}/timeout`);
      // Refresh the guest list after successful time-out
      toast.success("Time out recorded successfully");
      fetchGuests();
    } catch (error) {
      if (error.response?.status === 400) {
        // Show error message if guest is already logged out
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to record time out. Please try again.");
      }
    }
  };

  const handleDelete = async (guestId) => {
    if (!window.confirm("Are you sure you want to delete this guest?")) {
      return;
    }

    try {
      await api.delete(`/guests/${guestId}`);
      toast.success("Guest deleted successfully");
      fetchGuests(); // Fetch immediately after deletion
    } catch (error) {
      toast.error("Error deleting guest");
      console.error("Error:", error);
    }
  };

  const filteredGuests = guests.filter((guest) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      guest.fullName.toLowerCase().includes(searchLower) ||
      guest.gender.toLowerCase().includes(searchLower) ||
      guest.age.toString().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full mx-auto flex">
      <Sidebar />
      <div className="bg-white shadow rounded-lg p-6 flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, gender, or age..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGuests.map((guest) => {
                const latestRecord = guest.TimeRecords?.[0];
                const canLogTimeOut =
                  !latestRecord || latestRecord.type === "timeIn";

                return (
                  <tr key={guest.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {guest.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {guest.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {guest.gender}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-2">
                        {guest.TimeRecords?.filter(
                          (record) => record.type === "timeIn"
                        ).map((record) => (
                          <div
                            key={record.id}
                            className="flex items-center space-x-2 p-2 rounded-lg bg-green-50 border border-green-200"
                          >
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              In
                            </span>
                            <span className="text-gray-600">
                              {new Date(record.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-2">
                        {guest.TimeRecords?.filter(
                          (record) => record.type === "timeOut"
                        ).map((record) => (
                          <div
                            key={record.id}
                            className="flex items-center space-x-2 p-2 rounded-lg bg-red-50 border border-red-200"
                          >
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Out
                            </span>
                            <span className="text-gray-600">
                              {new Date(record.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTimeOut(guest.id)}
                          disabled={!canLogTimeOut}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                            canLogTimeOut
                              ? "bg-primary-600 hover:bg-primary-700 focus:ring-primary-500"
                              : "bg-gray-400 cursor-not-allowed"
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
                        >
                          {canLogTimeOut
                            ? "Log Time Out"
                            : "Already Logged Out"}
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
