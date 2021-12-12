const Csv = require('json2csv').Transform;
const Readable = require('stream').Readable;
const moment = require('moment');
const path = require('path');
const fs = require('fs');

exports.toCsv = async (req, res, next) => {
  try {
    const csvData = await Service.Product.getProductsCsv(req.user);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-disposition', `attachment; filename=${req.query.fileName || 'products'}.csv`);
    const readStream = new Readable();
    const stringData = JSON.stringify(csvData);
    const json2csv = new Csv({
      fields: [
      {
        label: Enums.ProductEnums.ExportCSVKeys.Category.value,
        value: row => (row.categoryName || '')
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.SAP.value,
        value: 'sap'
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.Name.value,
        value: 'name'
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.SalePrice.value,
        value: 'salePrice'
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.UnitSalePrice.value,
        value: row => (Enums.ProductEnums.ProductUnit.get(row.unitSalePrice).value || 'null')
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.Price.value,
        value: 'price'
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.UnitPrice.value,
        value: row => (Enums.ProductEnums.ProductUnit.get(row.unitPrice).value || 'null')
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.Lang.value,
        value: 'lang'
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.SKU.value,
        value: 'sku'
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.Weight.value,
        value: 'weight'
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.PackageSpecifications.value,
        value: 'packageSpecifications'
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.Producer.value,
        value: 'producer'
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.ShortDescription.value,
        value: 'shortDescription'
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.ExpiryDate.value,
        value: 'expiryDate'
      }, 
      {
        label: Enums.ProductEnums.ExportCSVKeys.Description.value,
        value: 'description'
      }, 
      {
        label: Enums.ProductEnums.ExportCSVKeys.Country.value,
        value: 'country'
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.IsActive.value,
        value: 'isActive'
      },
      {
        label: Enums.ProductEnums.ExportCSVKeys.IsPromotion.value,
        value: 'isPromotion'
      },
    ],
      header: true
    }, {
      highWaterMark: 16384,
      encoding: 'utf-8'
    });
    readStream._read = () => {};
    // TODO: Reduce the pace of pushing data here
    readStream.push(stringData);
    readStream.push(null);
    readStream.pipe(json2csv).pipe(res);
  } catch (e) {
    next(e);
  }
};

exports.fromCsv = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(PopulateResponse.error({
        message: 'Missing file!'
      }, 'ERR_MISSING_FILE'));
    }

    const csvPath = path.resolve(req.file.path);
    if (req.user.userRoles.find(x => x.Role === Enums.UserEnums.UserRole.Admin.value)) {
      await Service.Product.importCsv(req.body.shopId, csvPath);
    }else{
      await Service.Product.importCsv(req.user.shopId, csvPath);
    }

    // remove
    fs.unlinkSync(csvPath);

    res.locals.fromCsv = { success: true };
    return next();
  } catch (e) {
    return next(e);
  }
};
