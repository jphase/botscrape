/**
 * MembersController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

  job: function(req, res) {
    Members.subscribe(req.socket);
  	Members.find().done(function(err, members){
	    if (err) { throw err; }
	    sails.log.debug(members);
			Members.publish(req.socket, members);
			res.send(members);
  	});
    res.view();
  }

};