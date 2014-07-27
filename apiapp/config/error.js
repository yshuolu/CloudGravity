var ErrorTypes = {

	NOT_FOUND: {
		code: 100,
		message: '访问地址不存在'
	},

	INTERNAL: {
		code: 101,
		message: '服务器错误，请联系客服'
	},

	INVALID_PARAM: {
		code: 102,
		message: '请求参数非法'
	},

	INVALID_TIMESTAMP: {
		code: 103,
		message: '时间戳超时'
	},

	INVALID_SIGN: {
		code: 104,
		message: '请求签名非法'
	},

	INVALID_ACCESSID: {
		code: 105,
		message: 'accessID非法'
	},

	NO_RESULT: {
		code: 106,
		message: '查询无结果'
	},

	NO_PLAN: {
		code: 107,
		message: '当前无套餐'
	},

	PLAN_OUT: {
		code: 108,
		message: '当前套餐已用完'
	},

	INVALID_TRIAL: {
		code: 109,
		message: '非法试用请求'
	},

	TRIAL_OUT: {
		code: 110,
		message: '本次试用已耗尽'
	}

};

function newError(type){
	var type = type in ErrorTypes ? type : 'INTERNAL';

	//set error message
	var error = new Error(ErrorTypes[type].message);

	//set error code
	error.errorCode = ErrorTypes[type].code;

	//set error name
	error.name = type;

	return error;
}
 
function errorHandler(){
	return function(err, req, res, next){

		if (err.status) res.statusCode = err.status;

		//404 NOT FOUND
		if (400 <= res.statusCode && res.statusCode <= 499) {
			err = newError('NOT_FOUND');
		}

		//errors not defined
		if (!err.errorCode){
			err = newError('INTERNAL');
		}

		//for internal error, send 500 status code
		if (err.name === 'INTERNAL')
			res.statusCode = 500;

		//all error output is json object
		res.json({error: {code: err.errorCode, error: err.message}});
	}
}

exports.newError = newError;

exports.errorConfig = function(app){
	app.use(errorHandler());
}