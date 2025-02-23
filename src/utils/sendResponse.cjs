const sendResponse = (res, data) => {
  let result;

  if (Array.isArray(data?.data)) {
    result = data.data.length;
  } else if (typeof data?.data === 'object' && data?.data !== null) {
    result = 1;
  }

  res.status(data.statusCode).json({
    status: 'success',
    message: data.message,
    result: result ?? null,
    meta: data?.meta || null,
    data: data.data,
  });
};

module.exports = sendResponse;
