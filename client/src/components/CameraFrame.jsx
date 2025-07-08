import React, { useEffect, useRef, useState } from "react";
import { useCameraFeed } from "../context/CameraFeedProvider";

const CameraFrame = () => {
  const { videoRef, cameraError } = useCameraFeed();
  return (
    <div className="hidden md:flex w-64 h-36 bg-amber-500 absolute top-5 right-5 border-2 border-white rounded overflow-hidden shadow-lg z-50">
      {cameraError ? (
        <p className="text-white text-sm text-center px-4">
          Camera not available
        </p>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default CameraFrame;
