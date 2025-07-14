import os from "os";
import mediasoup from "mediasoup";
import { config } from "../config/config.js";
const totalThreads = os.cpus().length;

export const createWorkers = async () => {
  let workers = [];
  for (let i = 0; i < totalThreads; i++) {
    const worker = await mediasoup.createWorker({
      rtcMinPort: config.workerSettings.rtcMinPort,
      rtcMaxPort: config.workerSettings.rtcMaxPort,
      logLevel: config.workerSettings.logLevel,
      logTags: config.workerSettings.logTags,
    });
    worker.on("died", () => {
      //this should never happen, but if it does, do x...
      console.log("Worker has died");
      process.exit(1); //kill the node program
    });
    workers.push(worker);
  }
  return workers;
};
