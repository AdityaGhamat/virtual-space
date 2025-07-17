import axios from "axios";

const serverUrl = `http://localhost:8080`;

export const apiService = {
  createRoom: async () => {
    try {
      const { data: room } = await axios.post(
        `${serverUrl}/api/room/create-room`
      );
      return room;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
};
