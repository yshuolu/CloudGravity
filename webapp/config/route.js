/**
 * Controllers
 */
var user = require('../routes/user');
var appController = require('../routes/app');
var auth = require('../middlewares/auth');

module.exports = function(app){
	app.post('/signin', user.signin);
	app.post('/signup', user.signup);
	app.get('/signout', user.signout);
	app.get('/', auth.userRequired(), user.test);

	//User app
	app.param('id', appController.loadApp());
	app.get('/app', auth.userRequired(), appController.list);
	app.post('/app/new', auth.userRequired(), appController.create);
	app.get('/app/:id', auth.userRequired(), appController.show);
	app.put('/app/:id', auth.userRequired(), appController.modify);
	app.del('/app/:id', auth.userRequired(), appController.delete);
	app.post('/app/:id', auth.userRequired(), appController.modifyOrDelete);
}