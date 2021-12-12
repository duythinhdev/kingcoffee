module.exports = {
  serverError(data) {
    return {
      code: 500,
      httpCode: 500,
      error: true,
      message: 'Lỗi server',
      data: data || null
    };
  },
  validationError(data) {
    return {
      code: 422,
      httpCode: 400,
      error: true,
      message: 'Nhập sai dữ liệu',
      data: data || null
    };
  },
  forbidden(data) {
    return {
      code: 403,
      httpCode: 403,
      error: true,
      message: 'Yêu cầu bị từ chối',
      data: data || null
    };
  },
  unauthenticated(data) {
    return {
      code: 401,
      httpCode: 401,
      error: true,
      message: 'Yêu cầu chưa được xác thực',
      data: data || null
    };
  },
  notFound(data) {
    return {
      code: 404,
      httpCode: 404,
      error: true,
      message: 'Không tìm thấy dữ liệu',
      data: data || null
    };
  },
  fetchSuccess(data) {
    return {
      code: 200,
      error: false,
      message: 'Lấy dữ liệu thành công',
      data
    };
  },
  createSuccess(data) {
    return {
      code: 200,
      error: false,
      message: 'Khởi tạo thành công',
      data
    };
  },
  updateSuccess(data) {
    return {
      code: 200,
      error: false,
      message: 'Cập nhật thành công',
      data
    };
  },
  deleteSuccess(data) {
    return {
      code: 200,
      error: false,
      message: 'Xóa thành công',
      data
    };
  },
  deleteUnaccepted(data) {
    return {
      code: 400,
      error: false,
      message: 'Yêu cầu xóa bị từ chối',
      data
    };
  },
  success(data = null, message = '', code = 200, httpCode = 200) {
    return {
      code,
      httpCode,
      error: false,
      message,
      data
    };
  },
  error(data = null, message = '', code = 400, httpCode = 400) {
    return {
      code,
      httpCode,
      error: true,
      message,
      data
    };
  }
};
