function sendData(res, status, data, meta) {
  const body = { data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

function sendError(res, status, code, message, details) {
  const error = { code, message };
  if (details) error.details = details;
  return res.status(status).json({ error });
}

module.exports = {
  sendData,
  sendError
};
