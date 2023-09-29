const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = createError;
// ประกาศ variable และ export แบบนี้จะได้ auto import ให้ในไฟล์อื่น
