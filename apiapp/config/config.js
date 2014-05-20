module.exports = {
	/**
	 * Development enviroment configuration
	 */
	development: {
		db: 'mongodb://localhost/data_platform_dev',
		port: 6666,
		cacheServer: 'localhost:11211',
		timestampExpire: 15 //minutes to reject request as replay attack
	}
}