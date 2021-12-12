exports.getCode = async (role) => {
  const dd = String(new Date().getDate()).padStart(2, '0');
  const mm = String(new Date().getMonth() + 1).padStart(2, '0');
  const yy = new Date().getFullYear().toString().substr(-2);
  const query = { orderCode: new RegExp(`${yy + mm + dd + role}00`) };

  try {
    const lastestOrders = await DB.Order.find(query, { orderCode: 1, _id: 0 }).sort({ orderCode: -1 }).limit(1);
    let nextOrderCode = `${yy + mm + dd + role}00001`
    if(lastestOrders[0]){
      const code = lastestOrders[0].orderCode;
      let index = parseInt(code.substring(code.length - 5, code.length)) + 1;

      //Xuất lỗi nếu số lượng order trong ngày vượt quá 9999 
      if(index >= 10000)
        throw new Error("Order number is over 10000");

      index = '0000' + index;
      index = index.substring(index.length - 5, index.length);
      nextOrderCode = `${yy + mm + dd + role + index}`
    }

    return nextOrderCode;
  } catch (error) {
    return '';
  }
};
