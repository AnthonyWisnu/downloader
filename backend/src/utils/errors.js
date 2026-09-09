function createServiceError(message, statusCode = 502) {
  const cleanMessage = message || "Gagal memproses permintaan";
  const formatted = cleanMessage.startsWith("ERR:") ? cleanMessage : `ERR: ${cleanMessage}`;
  const error = new Error(formatted);
  error.statusCode = statusCode;
  return error;
}

module.exports = {
  createServiceError
};
