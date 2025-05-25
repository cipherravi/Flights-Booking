const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const { combine, timestamp, label, printf, colorize, errors } = format;

const isProd = process.env.NODE_ENV === "production";

const myFormat = printf(({ level, message, label, timestamp, stack }) => {
  return `${timestamp} [${label}] ${level}: ${stack || message}`;
});

const getLogger = (filePath) => {
  const fileLabel = path.basename(filePath);

  const logFormat = combine(
    label({ label: fileLabel }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss " }),
    errors({ stack: true }),
    isProd ? format.json() : myFormat
  );

  return createLogger({
    level: "debug",
    format: logFormat,
    transports: [
      new transports.Console({
        level: "debug",
        format: combine(
          colorize(),
          label({ label: fileLabel }),
          timestamp(),
          errors({ stack: true }),
          myFormat
        ),
      }),
      new DailyRotateFile({
        filename: "logs/info-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        level: "info",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        format: logFormat,
      }),
      new DailyRotateFile({
        filename: "logs/error-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        level: "error",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
        format: logFormat,
      }),
    ],
  });
};

module.exports = getLogger;
