// loggerMiddleware.js
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logDirectory = path.join(__dirname, '../logs');

// Cấu hình logger với daily rotate file
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
      filename: path.join(logDirectory, 'app-%DATE%.log'), // Tạo file theo dạng app-YYYY-MM-DD.log
      datePattern: 'YYYY-MM-DD', // Xoay file theo ngày
      maxFiles: '14d', // Giữ lại file log trong 14 ngày
      zippedArchive: true // Nén file log cũ thành .gz để tiết kiệm dung lượng
    })
  ]
});

const loggerMiddleware = (req, res, next) => {
  const method = req.method;
  const url = req.originalUrl;

  res.on('finish', () => {
    const statusCode = res.statusCode;
    logger.info(`${method} ${url} - ${statusCode}`);
  });

  next();
};

module.exports = loggerMiddleware;
