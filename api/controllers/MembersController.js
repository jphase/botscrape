/**
 * MembersController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var MembersController = {

	job: function(req, res) {
		// Members.subscribe(req.socket);
		// var something;
		// // Find members with id passed
		// Members.find()
		// .where({ id: req.param('id') })
		// .done(function(err, members) {
		// 	if(err) { throw err; }
		// 	sails.log.debug(members);
		// 	Members.publish(req.socket, members);
		// 	// res.send(members);
		// });

setTimeout(function() {
  console.log('world');
}, 100);

console.log('hello');		

		// res.view();
	}

};

module.exports = MembersController;