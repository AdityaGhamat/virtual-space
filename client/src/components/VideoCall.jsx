import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Device } from "mediasoup-client";
import { getPlayerRoom } from "../game/utils/getPlayerRoom.js"; // Reuse from your game
import { serverLink } from "../game/constants/server.js"; // e.g., "http://192.168.0.104:8080" or ngrok URL

const VideoCall = () => {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState(new Map()); // Track other players
  const [videoStreams, setVideoStreams] = useState(new Map()); // Track video elements
  const socketRef = useRef(null);
  const deviceRef = useRef(null);
  const sendTransportRef = useRef(null);
  const recvTransportRef = useRef(null);
  const localVideoRef = useRef(null);

  // Simulated player position (replace with actual logic if needed)
  const [position, setPosition] = useState({ x: 400, y: 300 }); // Default like PLAYER_START_X, PLAYER_START_Y

  useEffect(() => {
    // Initialize Socket.IO
    socketRef.current = io(serverLink, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log(`Connected to server with ID: ${socketRef.current.id}`);
      // Initialize player with position and room
      const initialRoom = getPlayerRoom(position.x, position.y);
      socketRef.current.emit("initPlayer", {
        x: position.x,
        y: position.y,
        room: initialRoom ? initialRoom.name : null,
      });
      setRoom(initialRoom ? initialRoom.name : null);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error(`Socket.IO connection error: ${error.message}`);
    });

    // Initialize MediaSoup device
    deviceRef.current = new Device();

    // Handle router RTP capabilities
    socketRef.current.on("routerRtpCapabilities", async (rtpCapabilities) => {
      try {
        await deviceRef.current.load({
          routerRtpCapabilities: rtpCapabilities,
        });
        console.log("MediaSoup device loaded");
      } catch (err) {
        console.error(`MediaSoup device load error: ${err.message}`);
      }
    });

    // Handle transport parameters
    socketRef.current.on("transportParams", async ({ send, recv }) => {
      try {
        sendTransportRef.current = deviceRef.current.createSendTransport({
          id: send.id,
          iceParameters: send.iceParameters,
          iceCandidates: send.iceCandidates,
          dtlsParameters: send.dtlsParameters,
        });

        recvTransportRef.current = deviceRef.current.createRecvTransport({
          id: recv.id,
          iceParameters: recv.iceParameters,
          iceCandidates: recv.iceCandidates,
          dtlsParameters: recv.dtlsParameters,
        });

        sendTransportRef.current.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              socketRef.current.emit("connectTransport", {
                dtlsParameters,
                type: "send",
              });
              callback();
            } catch (err) {
              errback(err);
            }
          }
        );

        recvTransportRef.current.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              socketRef.current.emit("connectTransport", {
                dtlsParameters,
                type: "recv",
              });
              callback();
            } catch (err) {
              errback(err);
            }
          }
        );

        // Start local video/audio stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        if (videoTrack) {
          await sendTransportRef.current.produce({
            track: videoTrack,
            encodings: [
              { maxBitrate: 100000 },
              { maxBitrate: 300000 },
              { maxBitrate: 900000 },
            ],
            codecOptions: { videoGoogleStartBitrate: 1000 },
          });
        }
        if (audioTrack) {
          await sendTransportRef.current.produce({ track: audioTrack });
        }

        // Display local stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error(`Media stream error: ${err.message}`);
      }
    });

    // Handle new producer (remote stream)
    socketRef.current.on("newProducer", async ({ id: producerId, kind }) => {
      try {
        const consumer = await recvTransportRef.current.consume({
          producerId,
          rtpCapabilities: deviceRef.current.rtpCapabilities,
        });
        const stream = new MediaStream([consumer.track]);
        setVideoStreams((prev) => {
          const newStreams = new Map(prev);
          newStreams.set(producerId, stream);
          return newStreams;
        });
      } catch (err) {
        console.error(`Consumer error: ${err.message}`);
      }
    });

    // Handle consumer close
    socketRef.current.on("consumerClosed", ({ consumerId }) => {
      setVideoStreams((prev) => {
        const newStreams = new Map(prev);
        newStreams.delete(consumerId);
        return newStreams;
      });
    });

    // Handle player events
    socketRef.current.on("playerConnected", ({ id, x, y, room }) => {
      setPlayers((prev) => new Map(prev).set(id, { x, y, room }));
      console.log(`Player ${id} connected at (${x}, ${y}), room: ${room}`);
    });

    socketRef.current.on("existingPlayers", (players) => {
      const newPlayers = new Map();
      players.forEach(({ id, x, y, room }) => {
        if (id !== socketRef.current.id) {
          newPlayers.set(id, { x, y, room });
          console.log(
            `Added existing player ${id} at (${x}, ${y}), room: ${room}`
          );
        }
      });
      setPlayers(newPlayers);
    });

    socketRef.current.on("playerDisconnected", ({ id }) => {
      setPlayers((prev) => {
        const newPlayers = new Map(prev);
        newPlayers.delete(id);
        return newPlayers;
      });
      console.log(`Player ${id} disconnected`);
    });

    socketRef.current.on("playerEnteredRoom", ({ id, room, x, y }) => {
      setPlayers((prev) => new Map(prev).set(id, { x, y, room }));
      console.log(`Player ${id} entered room ${room}`);
    });

    // Cleanup on unmount
    return () => {
      socketRef.current.disconnect();
      videoStreams.forEach((_, producerId) => {
        const videoElement = document.getElementById(`video-${producerId}`);
        if (videoElement) videoElement.remove();
      });
    };
  }, []);

  // Simulate movement and room changes (replace with your UI logic)
  const updatePosition = (newX, newY) => {
    setPosition({ x: newX, y: newY });
    const newRoom = getPlayerRoom(newX, newY);
    if (newRoom && newRoom.name !== room) {
      setRoom(newRoom.name);
      socketRef.current.emit("playerRoomChanged", {
        room: newRoom.name,
        x: newX,
        y: newY,
      });
      console.log(`Player entered room: ${newRoom.name}`);
    }
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* Local video */}
      <video
        ref={localVideoRef}
        autoPlay
        style={{
          position: "absolute",
          width: "200px",
          height: "150px",
          top: "10px",
          left: "10px",
          border: "2px solid #000",
          background: "#000",
        }}
      />

      {/* Remote videos */}
      {Array.from(videoStreams.entries()).map(([producerId, stream]) => (
        <video
          key={producerId}
          id={`video-${producerId}`}
          autoPlay
          style={{
            position: "absolute",
            width: "200px",
            height: "150px",
            top: `${Math.random() * (window.innerHeight - 150)}px`,
            left: `${Math.random() * (window.innerWidth - 200)}px`,
            border: "2px solid #000",
            background: "#000",
          }}
          ref={(el) => el && (el.srcObject = stream)}
        />
      ))}

      {/* UI for testing movement (replace with your UI) */}
      <div style={{ position: "absolute", bottom: "10px", left: "10px" }}>
        <button onClick={() => updatePosition(position.x, position.y - 10)}>
          Up
        </button>
        <button onClick={() => updatePosition(position.x, position.y + 10)}>
          Down
        </button>
        <button onClick={() => updatePosition(position.x - 10, position.y)}>
          Left
        </button>
        <button onClick={() => updatePosition(position.x + 10, position.y)}>
          Right
        </button>
        <div>
          Position: ({position.x}, {position.y})
        </div>
        <div>Room: {room || "None"}</div>
      </div>
    </div>
  );
};

export default VideoCall;
