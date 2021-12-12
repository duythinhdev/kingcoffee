const Enum = require('enum');

exports.ProductUnit = new Enum({
    "bag" : "túi",
    "package" : "bịch",
    "box" : "hộp",
    "wire": "dây",
    "can": "lon",
    "bottle": "chai"
});

exports.ExportCSVKeys = new Enum({
    "Category": "Loại SP",
    "SAP": "Mã SAP",
    "Name": "Tên sản phẩm",
    "SalePrice": "Giá bán WE",
    "UnitSalePrice": "ĐVT WE",
    "Price": "Giá bán NTD",
    "UnitPrice": "ĐVT NTD",
    "Lang": "Ngôn ngữ",
    "SKU": "SKU",
    "Weight": "Khối lượng tịnh (KG)",
    "PackageSpecifications": "Qui cách đóng thùng",
    "Producer": "Nhà SX",
    "ShortDescription": "Thành phần",
    "ExpiryDate": "Hạn sử dụng",
    "Description": "Đặc điểm sản phẩm",
    "Country": "Quốc gia",
    "IsActive": "Kích hoạt",
    "IsPromotion": "Khuyến mãi"
})