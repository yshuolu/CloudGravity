exports.list = function(req, res, next){
	res.render('apilist', {user: req.session.user, index: 0});
}

exports.cell = function(req, res, next){
	var info = {
		title: '移动基站编号查询接口',
		description: '根据LAC和CELL号查询详细基站信息',
		address: '91yzh.cn/cell',
		example: 'api.yun.com/cell?lac=1&cell=1&access_id=be23d8b5735ebb9752c860255d9f207d&timestamp=1406876439&signature=KsSGoHq',
		params: [
			['lac', 'number', '大区号'],
			['cell', 'number', '小区号'],
			['hex', 'bool', 'true代表使用16进制，默认10进制']
		],
		return: JSON.stringify([{
					"MCC": 460,
					"MNC": 13824,
					"LAC": 1,
					"CELL": 1,
					"LAC16": "1",
					"CELL16": "1",
					"LNG": 116.95,
					"LAT": 28.29,
					"O_LNG": 116.95,
					"O_LAT": 28.29,
					"PRECISION": 1500,
					"ADDRESS": "江西省鹰潭市余江县龙风路中童镇叶家塘叶家塘东"
				}], null, 4)
	};

	switch (req.query.tab){
		case 'info':
			return res.render('api_info', {user: req.session.user, info: info, apiName: 'cell', index: 1});
			break;

		case 'trial':
			if (!req.session.user) return res.redirect('/signin');
			return res.render('cell_trial', {user: req.session.user, info: info, apiName: 'cell', index: 2});
			break;

		case 'offline':
			return res.render('api_offline', {user: req.session.user, info: info, apiName: 'cell', index: 3});
			break;

		default:
			var err = new Error('404 not found');
			err.status = 404;
			return next(err);
	}
}

exports.cellnearby = function(req, res, next){
	var info = {
		title: '移动基站经纬度查询接口',
		description: '查询某一经纬度坐标周边一定距离范围内的最近基站信息（最多10个）',
		address: '91yzh.cn/cell/near',
		example: 'api.yun.com/cell/near?access_id=c2ddcce410a09ed964a&dis=1000&lat=41.27&lng=82.96&timestamp=1406905004&signature=9OlgMv%',
		params: [
			['lng', 'number', '经度'],
			['lat', 'number', '纬度'],
			['dis', 'number', '距离']
		],
		return: JSON.stringify([
					{
					"MCC": 460,
					"MNC": 0,
					"LAC": 42327,
					"CELL": 24661167,
					"LAC16": "A556",
					"CELL16": "1784CAF",
					"LNG": 114.02,
					"LAT": 23.01,
					"O_LNG": 114.03,
					"O_LAT": 23.01,
					"PRECISION": 878,
					"ADDRESS": "广东省东莞市沙湖口市场路附近"
					},
					{
					"MCC": 460,
					"MNC": 0,
					"LAC": 9563,
					"CELL": 44806,
					"LAC16": "255A",
					"CELL16": "AF06",
					"LNG": 114.02,
					"LAT": 23.01,
					"O_LNG": 114.02,
					"O_LAT": 23.01,
					"PRECISION": 1716,
					"ADDRESS": "广东省东莞市池田西路附近"
					}
				], null, 4)
	};

	switch (req.query.tab){
		case 'info':
			return res.render('api_info', {user: req.session.user, info: info, apiName: 'cellnearby', index: 1});
			break;

		case 'trial':
			if (!req.session.user) return res.redirect('/signin');
			return res.render('cellnearby_trial', {user: req.session.user, info: info, apiName: 'cellnearby', index: 2});
			break;

		case 'offline':
			return res.render('api_offline', {user: req.session.user, info: info, apiName: 'cellnearby', index: 3});
	}
}