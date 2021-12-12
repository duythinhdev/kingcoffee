exports.create = async (orderLog) => {
  await DB.OrderLog.create(orderLog);
};

exports.find = async (options) => {
  const query = options;
  const orderLogs = await DB.OrderLog.find(query);
  console.log(orderLogs);
  return orderLogs.map((orderLog) => ({
    eventType: orderLog.eventType,
    orderId: orderLog.orderId,
    oldData: orderLog.oldData,
    newData: orderLog.newData,
    createdAt: orderLog.createdAt,
  }));
};
