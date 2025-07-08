import { createContext, useRef, useState, useEffect, useContext } from "react";

const CameraFeedContext = createContext();

export default function CameraFeedContextProvider({ children }) {
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);
  const getCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access denied or unavailable:", error);
      setCameraError(true);
    }
  };
  useEffect(() => {
    getCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current?.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);
  return (
    <CameraFeedContext.Provider
      value={{ videoRef, cameraError, retryCamera: getCamera }}
    >
      {children}
    </CameraFeedContext.Provider>
  );
}

export const useCameraFeed = () => useContext(CameraFeedContext);
