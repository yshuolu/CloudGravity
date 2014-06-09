/**
 * Middlewares
 */

var auth = require('../middlewares/auth');


/**
 * Controllers
 */

var user = require('../routes/user'),
	appController = require('../routes/app'),
	admin = require('../routes/admin');
//var land = require('../routes/land');

module.exports = function(app){
	app.get('/', appController.list);

	app.get('/login', user.loginPage);
	app.post('/signin', user.signin);
	app.post('/signup', user.signup);
	app.get('/signout', user.signout);
	app.get('/profile', auth.userRequired(), user.profile);

	//User app
	app.param('id', appController.loadApp());
	app.get('/createapp', auth.userRequired(), appController.createPage);
	app.post('/app/new', auth.userRequired(), appController.create);
	app.get('/app/:id', auth.userRequired(), appController.show);
	app.put('/app/:id', auth.userRequired(), appController.modify);
	app.del('/app/:id', auth.userRequired(), appController.delete);
	app.post('/app/:id', auth.userRequired(), appController.modifyOrDelete);

	//Admin
	app.param('accessid', admin.loadApp());
	app.get('/admin/bill/:accessid', admin.createNextBilling);
}
