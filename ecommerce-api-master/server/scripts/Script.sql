-- -- ----------------------------
-- Description : Config Maintenance
-- BĐ - 20201022
db.configs.updateOne(
   {_id: ObjectId("5e71d8612fda9848c23dc618")},
   { $set: { type: "mixed", key: "isMaintenance", value: false, name: "Maintenance", isActived: true, public: true }}
)

-- -- ----------------------------
-- Description : Update updatedAt of all transaction 
-- quangth - 04112020
db.transactions.updateMany( {userId: ObjectId('')}, { $set : { "updatedAt" : new ISODate("2020-03-15T00:00:00Z") } }, true, true);

-- Description : Change Payment Gateway Config
-- quangth - 20201022
db.configs.update(
{ "key": "paymentGatewayConfig"},
{$set: 
	{ 
			"value" : {
				"paymentMethods": 
				[
					{
							"name": "InvestWallet",	
							"value": "viTni",
							"enable": true
					},
					{
							"name": "MoMo",				
							"value": "momo",
							"enable": true
					},
					{
							"name": "COD",
							"value": "cod",
							"enable": true
					}
				]
		}
	}
});

-- -- ----------------------------
-- Description : Unpublic public phone and public email
-- quangth - 20201022
db.configs.update(
{ "key": "publicPhone"},
{ $set: { "public": false, "isActived": false }});

db.configs.update(
{ "key": "publicEmail"},
{ $set: { "public": false, "isActived": false }});

db.configs.update(
{ "key": "homeSEO"},
{ $set: { "public": false, "isActived": false }});

-- -- ----------------------------
-- Description : Insert KPI config
-- quangth - 20201102
db.configs.insert(
{
    "group": "system",
    "public": true,
    "type": "mixed",
    "key": "kpiConfig",
    "value": {
			"kpiMonth": [
				{
					"level": 30000000,
					"valuePercent": 1.8,
				},
				{
					"level": 50000000,
					"valuePercent": 2.0,
				},
				{
					"level": 70000000,
					"valuePercent": 2.2,
				}
			],
			"kpiReward": 1.8
		},
    "name": "KPI",
    "priority": NumberInt("5"),
		"createdAt": new Date(),
    "__v": NumberInt("0"),
    "isActived": true
});

-- -- ----------------------------
-- Description : Public trade discount config
-- quangth - 20201201
db.configs.update(
{ "key": "tradeDiscount"},
{ $set: { "public": true, "isActived": true }});

