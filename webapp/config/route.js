/**
 * Middlewares
 */

var auth = require('../middlewares/auth');


/**
 * Controllers
 */

var user = require('../routes/user'),
	appController = require('../routes/app');
	admin = require('../routes/admin'),
	order = require('../routes/order');
//var land = require('../routes/land');

module.exports = function(app){
	app.get('/', appController.list);

	app.get('/signin', user.signinPage);
	app.get('/signup', user.signupPage);
	app.post('/signin', user.signin);
	app.post('/signup', user.signup);
	app.get('/signout', user.signout);
	app.get('/profile', auth.userRequired(), user.profile);

	//User app
	app.param('id', appController.loadApp());
	app.get('/app/new', auth.userRequired(), appController.createPage);
	app.post('/app/new', auth.userRequired(), appController.create);
	app.get('/app/:id', auth.userRequired(), appController.show);
	app.put('/app/:id', auth.userRequired(), appController.modify);
	app.del('/app/:id', auth.userRequired(), appController.delete);
	app.post('/app/:id', auth.userRequired(), appController.modifyOrDelete);

	//Order
	app.post('/order/new', auth.userRequired(), order.create);
	app.get('/order/preview/:id', auth.userRequired(), order.preview);
	app.get('/order/:shortId', order.show);

	//Admin
	app.get('/admin/signup', admin.signupPage);
	app.post('/admin/signup', admin.signup);
	app.post('/admin/invite', admin.invite);
	app.post('/admin/approve', auth.adminRequired(), admin.loadOrder(), admin.newBillingPlan);
	app.get('/admin/orderlist', auth.adminRequired(), admin.pendingOrders);
	app.get('/admin', auth.adminRequired(), admin.pendingOrders);
}
