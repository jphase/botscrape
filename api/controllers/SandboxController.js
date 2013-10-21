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
		var matched = [];

		// Escape all RegEx reserved characters from string - http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex#6969486
		function escRegExp(str) {
			return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		}

		// Return content based on match values in database for matched values
		function matchLine($, valz) {
			// Create a regex based on the bot match string
			var regex = new RegExp(escRegExp(valz.match_string), 'gim');
			// Generate results based on regex matches within match_parent
			var results = [];
			// Check for martch_parent and match_el
			if($(valz.match_parent).length && $(valz.match_el).length) {
				$(valz.match_el).each(function(index, element) {
					// For using .toString() method on regex match
					var item = element;
					// Match regex on entire parent
					// var match = item.toString().match(regex);
					var match = $(this).text().match(regex);
					if(match != 'undefined' && match != null) {
						// Change match to content from return_el
						$(this).find(valz.return_el).each(function(index, child_el) {
							sails.log.debug($(this));
							results.push($(this).text());
						});
						if(match.length) results.push(match);
					}
				});
			}
			return results;
		}

		// Render view after data is retrieved
		var successCallback = function(bot, data) {
			// Debug
			// sails.log.debug(data);
			// Push data to view, kthxbye
			res.view({
				bot: bot,
				results: data.toString()
			});
		}

		// Request data from URL and filter through match functions above
		var requestURL = function(callback) {
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
				// Request source from URL and match
				request(sandbox[0].url, function(error, response, html) {
					if(!error && response.statusCode == 200) {
						// Set $ as cheerio html DOM object from request URL
						var $ = cheerio.load(html);
						// Return entire line when match is found
						var matched = matchLine($, sandbox[0]);
						successCallback(sandbox[0], matched);
						// Debug
						// sails.log.debug(matched);
					}
				});
			});
		}

		// Call request function
		requestURL(successCallback);
	}

};