/**
 * MembersController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var MembersController = {

	job: function(req, res) {
		Members.subscribe(req.socket);
		// Find members with id passed
		var something;
		Members.find()
		.where({ id: req.param('id') })
		.done(function(err, members) {
			if(err) { throw err; }
			sails.log.debug(members);
			something = members;
			Members.publish(req.socket, members);
		});

		res.send('this works');
		// res.send(something);  // this doesn't work
		res.view();
	}

};

module.exports = MembersController;