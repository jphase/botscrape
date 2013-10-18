/**
 * MembersController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var MembersController = {

	job: function(req, res) {
		// Subscribe
		Members.subscribe(req.socket);
		// Find members with id passed
		Members.find()
		.where({ id: req.param('id') })
		.done(function(err, members) {
			// Throw teh errorz
			if(err) { throw err; }
			// Publish
			Members.publish(req.socket, members);
			// Push to view kthxbye
			res.view({
				members: members[0]
			});
		});
	}

};

module.exports = MembersController;