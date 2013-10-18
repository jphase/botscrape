/**
 * SandboxController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

	scrape: function(req, res) {
		// Initialize
		var cheerio = require('cheerio');
		var request = require('request');

		// Subscribe
		Sandbox.subscribe(req.socket);
		// Find bots with id passed
		Sandbox.find()
		.where({ id: req.param('id') })
		.done(function(err, sandbox) {
			// Throw teh errorz
			if(err) { throw err; }
			// Publish
			Sandbox.publish(req.socket, sandbox);
			// Issue request for content
			var matched = [];
			request(sandbox[0].url, function(error, response, html) {
				if(!error && response.statusCode == 200) {
					// Initialize
					var $ = cheerio.load(html);
					var regex = new RegExp(sandbox[0].match, 'ig');
					var matches = $.text().match(regex);
					// Debug
					sails.log.debug(html);
					sails.log.debug(matches);
				}
			});
			// Push to view kthxbye
			res.view({
				bot: sandbox[0],
				results: matched
			});
		});
	}  

};
