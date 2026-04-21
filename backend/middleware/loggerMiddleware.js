const morgan = require('morgan');

/**
 * Production-ready logging middleware
 */
const setupLogging = (app) => {
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }
};

module.exports = setupLogging;
