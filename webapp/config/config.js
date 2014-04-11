module.exports = {
	/**
	 * Development enviroment configuration
	 */
	development: {
		db: 'mongodb://localhost/data_platform_dev',
		port: 8888,
		secret: 'this is a secret',
		sessionMaxAge: 90000 //90s
	}
}