// src/utils/response.util.js

// Format response thành công
exports.successResponse = (res, data, message = "Thành công", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

// Format response lỗi
exports.errorResponse = (res, message, status = 500, error = null) => {
  const response = {
    success: false,
    message,
  };

  if (error) {
    response.error = error.message;
  }

  return res.status(status).json(response);
};

// Format response với count
exports.listResponse = (res, data, count, message = "Thành công") => {
  return res.status(200).json({
    success: true,
    message,
    count,
    data,
  });
};
