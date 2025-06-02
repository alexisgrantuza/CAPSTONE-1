import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const AdminDashboard = () => {
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Function to fetch guests
  const fetchGuests = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/guests");
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
      await axios.put(`http://localhost:3000/api/guests/${guestId}/timeout`);
      toast.success("Time out recorded successfully");
      fetchGuests(); // Fetch immediately after timeout
    } catch (error) {
      toast.error("Error recording time out");
      console.error("Error:", error);
    }
  };

  const filteredGuests = guests.filter((guest) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      guest.fullName.toLowerCase().includes(searchLower) ||
      guest.gender.toLowerCase().includes(searchLower) ||
      guest.age.toString().includes(searchLower) ||
      (guest.timeIn && guest.timeIn.toLowerCase().includes(searchLower))
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
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, gender, age, or time in..."
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
              {filteredGuests.map((guest) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {guest.timeIn
                      ? new Date(guest.timeIn).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {guest.timeOut
                      ? new Date(guest.timeOut).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {!guest.timeOut && (
                      <button
                        onClick={() => handleTimeOut(guest.id)}
                        className="btn-primary"
                      >
                        Log Time Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
