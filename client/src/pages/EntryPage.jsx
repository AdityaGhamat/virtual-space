import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../server/serverCalls";
const EntryPage = () => {
  const navigate = useNavigate();
  const [room, SetRoom] = useState(null);
  const [roomName, SetRoomName] = useState(null);
  const [password, SetPassword] = useState(null);

  async function createRoomId(e) {
    e.preventDefault();
    const room = await apiService.createRoom();
    SetRoom(room);
  }
  useEffect(() => {
    console.log(room);
    if (room) {
      navigate(room.redirectUrl);
    }
  }, [room]);
  return (
    <div className="max-w-full min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <form
        onSubmit={createRoomId}
        className="flex flex-col items-center justify-center p-4 space-y-4 rounded-lg shadow-md"
      >
        <input
          type="text"
          name="RoomName"
          placeholder="Enter room name"
          onChange={(e) => SetRoomName(e.target.value)}
          className="border border-gray-300 text-gray-800 text-lg flex-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="password"
          name="Password"
          placeholder="Enter password of room"
          onChange={(e) => SetPassword(e.target.value)}
          className="border border-gray-300 text-gray-800 text-lg flex-1 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md"
        >
          Create Room
        </button>
      </form>
    </div>
  );
};

export default EntryPage;
