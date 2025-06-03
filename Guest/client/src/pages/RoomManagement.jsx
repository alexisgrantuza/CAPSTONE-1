import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({
    title: "",
    description: "",
    code: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get("/rooms");
      setRooms(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching rooms");
      setLoading(false);
    }
  };

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRoom.title || !newRoom.description) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const roomCode = generateRoomCode();
      const response = await api.post("/rooms", {
        ...newRoom,
        code: roomCode,
      });

      setRooms([...rooms, response.data]);
      setNewRoom({ title: "", description: "", code: "" });
      toast.success("Room created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating room");
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    try {
      await api.delete(`/rooms/${roomId}`);
      setRooms(rooms.filter((room) => room.id !== roomId));
      toast.success("Room deleted successfully");
    } catch (error) {
      toast.error("Error deleting room");
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

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Room Management</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Room</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Room Title
              </label>
              <input
                type="text"
                value={newRoom.title}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, title: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter room title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={newRoom.description}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, description: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="3"
                placeholder="Enter room description"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Room
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Rooms</h2>
          <div className="grid gap-4">
            {rooms.map((room) => (
              <div key={room.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{room.title}</h3>
                    <p className="text-gray-600">{room.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Room Code</p>
                    <p className="font-mono text-lg">{room.code}</p>
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => navigate(`/admin/rooms/${room.id}`)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View Room
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        Delete Room
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;
