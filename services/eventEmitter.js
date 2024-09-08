import { EventEmitter } from "events";
import fs from "fs";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const eventEmitter = new EventEmitter();
const logFilePath = path.join(__dirname, "../filesUpload.log");

const logToFile = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) console.error("Error writing to log file:", err);
  });
};

eventEmitter.on("fileUploadStart", () => {
  logToFile("File upload started");
});

eventEmitter.on("fileUploadEnd", () => {
  logToFile("File upload ended successfully");
});

eventEmitter.on("fileUploadFailed", (error) => {
  logToFile(`File upload failed: ${error.message}`);
});

export default eventEmitter;
