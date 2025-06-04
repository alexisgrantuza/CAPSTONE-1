import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/axios";
import QRGenerator from "../components/QRGenerator";

const Room = () => {
  const { roomCode } = useParams();
  const [room, setRoom] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await api.get(`/rooms/code/${roomCode}`);
        setRoom(response.data);
        // Fetch guests for this room
        const guestsResponse = await api.get(`/rooms/code/${roomCode}/guests`);
        setGuests(guestsResponse.data);
      } catch (error) {
        toast.error("Error fetching room details");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Room not found</h1>
          <p className="text-gray-600 mt-2">
            Please check the room code and try again
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Room Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {room.title}
          </h1>
          <p className="text-gray-600 text-lg">{room.description}</p>
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Room Code: {room.code}
            </span>
          </div>
        </div>

        {/* Guest List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Registered Guests
          </h2>
          {guests.length === 0 ? (
            <p className="text-gray-600">No guests registered yet</p>
          ) : (
            <div className="space-y-4">
              {guests.map((guest, index) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-500">{index + 1}.</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {guest.fullName}
                      </p>
                      <p className="text-sm text-gray-500">Age: {guest.age}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{guest.gender}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QR Generator */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Guest Registration
          </h2>
          <QRGenerator />
        </div>
      </div>
    </div>
  );
};

export default Room;
