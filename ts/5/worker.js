import { parentPort, workerData } from "worker_threads";
import { getMinimumLocation } from "./helper";

// Function to perform a CPU-bound task
function performCpuBoundTask({ seedStart, seedRangeLength, mappings }) {
  return getMinimumLocation(seedStart, seedRangeLength, mappings);
}

// Perform the CPU-bound task with the provided data
const result = performCpuBoundTask(workerData);

// Send the result back to the main thread
parentPort.postMessage(result);
