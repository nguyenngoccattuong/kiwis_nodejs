const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logDirectory = path.join(__dirname, '../logs');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(logDirectory, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      zippedArchive: true
    })
  ]
});

const loggerMiddleware = (req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip;
  const userAgent = req.get('user-agent');
  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);

  res.on('finish', () => {
    const statusCode = res.statusCode;
    const logMessage = [
      `Method: ${method}`,
      `URL: ${url}`, 
      `Status: ${statusCode}`,
      `IP: ${ip}`,
      `User-Agent: ${userAgent}`,
      `Query Params: ${query}`,
      `Body: ${body}`,
      '-----'
    ].join('\n');

    logger.info(logMessage);
  });

  next();
};

module.exports = loggerMiddleware;
