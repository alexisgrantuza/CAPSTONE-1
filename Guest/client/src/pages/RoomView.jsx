import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/axios";
import Sidebar from "../components/Sidebar";
import QRGenerator from "../components/QRGenerator2";
import {
  FiArrowLeft,
  FiClock,
  FiHash,
  FiFileText,
  FiUsers,
  FiLogIn,
  FiLogOut,
  FiAlertTriangle,
} from "react-icons/fi";

const RoomView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTimeOutLoading, setIsTimeOutLoading] = useState(false);
  const [stats, setStats] = useState({
    totalGuests: 0,
    timeInCount: 0,
    timeOutCount: 0,
  });

  useEffect(() => {
    fetchRoom();
    fetchStats();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const response = await api.get(`/rooms/${id}`);
      setRoom(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching room details");
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/rooms/${id}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching room stats:", error);
    }
  };

  const handleTimeOutAll = async () => {
    if (!stats.timeInCount) {
      toast.info("No guests are currently timed in");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to time out all ${stats.timeInCount} guests?`
      )
    ) {
      return;
    }

    setIsTimeOutLoading(true);
    try {
      await api.post(`/rooms/${id}/timeout-all`);
      toast.success("All guests have been timed out successfully");
      fetchStats(); // Refresh stats after timeout
    } catch (error) {
      toast.error(error.response?.data?.message || "Error timing out guests");
    } finally {
      setIsTimeOutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Room not found</h2>
            <button
              onClick={() => navigate("/admin/management")}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiArrowLeft className="mr-2" />
              Back to Room Management
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{room.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Room Management Dashboard
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleTimeOutAll}
                disabled={isTimeOutLoading || stats.timeInCount === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {isTimeOutLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiAlertTriangle className="mr-2" />
                    Time Out All Guests
                  </>
                )}
              </button>
              <button
                onClick={() => navigate("/admin/management")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiArrowLeft className="mr-2" />
                Back to Management
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Room Details Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Room Details
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-100 text-blue-600">
                          <FiHash className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-500">
                          Room Code
                        </h3>
                        <p className="mt-1 text-lg font-mono text-gray-900">
                          {room.code}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-100 text-green-600">
                          <FiFileText className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-500">
                          Description
                        </h3>
                        <p className="mt-1 text-gray-900">{room.description}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-100 text-purple-600">
                          <FiClock className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-500">
                          Created At
                        </h3>
                        <p className="mt-1 text-gray-900">
                          {new Date(room.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Attendance Statistics */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Attendance Statistics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-100 text-indigo-600">
                                <FiUsers className="h-6 w-6" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-500">
                                Total Guests
                              </p>
                              <p className="text-2xl font-semibold text-gray-900">
                                {stats.totalGuests}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-100 text-green-600">
                                <FiLogIn className="h-6 w-6" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-500">
                                Time In
                              </p>
                              <p className="text-2xl font-semibold text-gray-900">
                                {stats.timeInCount}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="flex items-center justify-center h-10 w-10 rounded-md bg-red-100 text-red-600">
                                <FiLogOut className="h-6 w-6" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-500">
                                Time Out
                              </p>
                              <p className="text-2xl font-semibold text-gray-900">
                                {stats.timeOutCount}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Room QR Code
                  </h2>
                  <div className="flex flex-col items-center justify-center">
                    <QRGenerator value={room.code} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomView;
