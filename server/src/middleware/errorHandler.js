const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  // eslint-disable-next-line no-param-reassign
  error.status = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message || 'Server Error'
  });
};

module.exports = { notFound, errorHandler };