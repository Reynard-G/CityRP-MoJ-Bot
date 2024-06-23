const winston = require("winston");
const chalk = require("chalk");

const pipe = chalk.dim(chalk.gray("|"));
const left = chalk.dim(chalk.gray("["));
const right = chalk.dim(chalk.gray("]"));

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  success: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "white",
  success: "green",
  debug: "cyan",
};

const icons = {
  error: "!",
  warn: "*",
  info: "?",
  success: "$",
  debug: "i",
};

winston.addColors(colors);

// Function to strip ANSI color codes
function stripAnsi(str) {
  const pattern = [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))",
  ].join("|");
  return str.replace(new RegExp(pattern, "g"), "");
}

const getTimestamp = () => {
  const date = new Date();
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    hour12: false,
  };
  return new Intl.DateTimeFormat("en-US", options)
    .format(date)
    .replace(",", "");
};

const consoleFormat = winston.format.printf(
  ({ level, message, timestamp, path }) => {
    const color = colors[level];
    const icon = icons[level];
    const formattedDate = chalk.dim(chalk.white(`${left}${timestamp}${right}`));

    return chalk[color](
      `${formattedDate} ${left}${icon}${right} ${pipe} ${chalk.bold(message)}${path ? ` ${pipe} ${path}` : ""}`
    );
  }
);

const fileFormat = winston.format.printf(
  ({ level, message, timestamp, path }) => {
    const icon = icons[level];
    return `[${timestamp}] [${icon}] | ${stripAnsi(message)}${path ? ` | ${path}` : ""}`;
  }
);

const logger = winston.createLogger({
  levels: levels,
  level: "debug",
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp({ format: getTimestamp }),
        consoleFormat
      ),
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp({ format: getTimestamp }),
        fileFormat
      ),
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp({ format: getTimestamp }),
        fileFormat
      ),
    }),
  ],
});

module.exports = logger;
