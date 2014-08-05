module.exports = {
	/**
	 * Development enviroment configuration
	 */
	development: {
		db: 'mongodb://localhost/data_platform_dev',
		port: 6666,
		cacheServer: 'localhost:11211',
		timestampExpire: 15, //minutes to reject request as replay attack
		planLimit: [10, 500],
		trialLimit: 10,
		trialInterval: 1, // trial interval in minutes
		allowedDomains: ['http://yun.com'],
		allowedHeaders: ['User-Email', 'User-Trial-Key']
	}
}