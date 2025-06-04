import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/axios";
import Sidebar from "../components/Sidebar";
import QRGenerator from "../components/QRGenerator";

const RoomView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoom();
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

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Room not found</h2>
            <button
              onClick={() => navigate("/admin/management")}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Back to Room Management
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{room.title}</h1>
            <button
              onClick={() => navigate("/admin/management")}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Room Management
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Room Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Room Code
                    </label>
                    <p className="mt-1 text-lg font-mono">{room.code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <p className="mt-1 text-gray-600">{room.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Created At
                    </label>
                    <p className="mt-1 text-gray-600">
                      {new Date(room.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <h2 className="text-xl font-semibold mb-4">Room QR Code</h2>
                <QRGenerator value={room.code} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomView;
