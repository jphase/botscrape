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
		var extend = require('jquery-extend');

		// Settings
		var bot = {
			matched: [],
			domain: false,
			links: true
		}

		// Escape all RegEx reserved characters from string - http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex#6969486
		function escRegExp(str) {
			return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		}

		// Return content based on match values in database for matched values
		function matchLine($, valz, optz) {
			// Create a regex based on the bot match string
			var regex = new RegExp(escRegExp(valz.match_string), 'gim');
			// Generate results based on regex matches within match_parent
			var results = [];
			// Check for match_parent and match_el and loop through each
			if($(valz.match_parent).length && $(valz.match_el).length) {
				$(valz.match_el).each(function(index, element) {
					// Match regex on current match_el
					var match = $(this).text().match(regex);
					if(match != 'undefined' && match != null) {
						// Change match to content from return_el
						$(this).find(valz.return_el).each(function(index, child_el) {
							// Push matches to results array
							// sails.log.debug($(this).html());
							results.push(filter($(this), optz));
						});
						results.push('<br>');
						// if(match.length) results.push(match);
					}
				});
			}
			return results;
		}

		// Filter matched elements
		function filter($, optz) {
			// Filter links
			if(optz.links) {
				$.find('a').each(function(index, a) {
					// Add bot URL to relative links
					if(!this.attr('href').indexOf(optz.domain) >= 0) {						
						this.attr('href', optz.domain + this.attr('href'));
					}
				});
			}
			return $;
		}

		// Render view after data is retrieved
		var successCallback = function(bot, data) {
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
				// Throw errors
				if(err) { throw err; }
				// Publish
				Sandbox.publish(req.socket, sandbox);
				// Request source from URL and match
				request(sandbox[0].url, function(error, response, html) {
					if(!error && response.statusCode == 200) {
						// Set $ as cheerio html DOM object from request URL
						var $ = cheerio.load(html);
						// Set bot domain as url without trailing slash
						bot.domain = sandbox[0].url.replace(/\/$/, '');
						// Set bot matched content
						bot.matched = matchLine($, sandbox[0], bot);
						// Callback
						successCallback(sandbox[0], bot.matched);
					}
				});
			});
		}

		// Call request function
		requestURL(successCallback);
	}

};