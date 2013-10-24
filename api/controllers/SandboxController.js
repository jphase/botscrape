/**
 * SandboxController
 *
 * @module		:: Controller
 * @description	:: Sandbox environment to test scraping external website content with cheerio, finding regex matches, returning filtered content within matches, and perform various cron operations based on data set in redis database.
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
			linksfix: true,
			recurse: true
		}

		// Recurse through matched elements
		function recurse($, optz) {
			sails.log.debug($);
			// Check for recurse option
			if(optz.recurse) {
				// Check for a recursion element in $ (cheerio object param)
				$.each(function(index, next) {
					sails.log.debug(this.attr('href'));
					var link = fixLinks(this.attr('href'), optz);
					requestURL(link.attr('href'), optz);
				});
			}
		}

		// Escape all RegEx reserved characters from string - http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex#6969486
		function escRegExp(str) {
			return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		}

		// Return content based on match values in database for matched values
		function matchContent($, valz, optz) {
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
							results.push(fixLinks($(this), optz));
						});
						results.push('<br>');
					}
				});
				// Recurse as needed
				// recurse($(valz.next_page_el), optz);
			}
			return results;
		}

		// Fix links that have relative URLs
		function fixLinks($, optz) {
			// Filter links
			if(optz.linksfix) {
				$.find('a').each(function(index, a) {
					// Fix relative links by adding bot URL
					if(!this.attr('href').indexOf(optz.domain) >= 0) {
						var domain = optz.domain.split('/');
						domain = domain[0] + '//' + domain[2];
						this.attr('href', domain + this.attr('href'));
					}
				});
			}
			return $;
		}

		// Render view after data is retrieved
		var successCallback = function(botz, data) {
			res.view({
				bot: botz,
				results: data.toString()
			});
		}

		// Request URL
		var requestURL = function(url, botz) {
			// Request source from URL and match
			request(url.replace(/\/$/, ''), function(error, response, html) {
				if(!error && response.statusCode == 200) {
					// Set $ as cheerio html DOM object from request URL
					var $ = cheerio.load(html);
					// Set bot matched content
					bot.matched = matchContent($, botz, bot);
					// Callback
					successCallback(botz, bot.matched);
				}
			});
		}

		// Request data from URL and filter through match functions above
		var getBot = function(callback) {
			// Subscribe
			Sandbox.subscribe(req.socket);
			// Find bots with id passed in request URL
			Sandbox.find()
			.where({ id: req.param('id') })
			.done(function(err, sandbox) {
				// Throw errors
				if(err) { throw err; }
				// Publish
				Sandbox.publish(req.socket, sandbox);
				// Set bot domain as url without trailing slash
				bot.domain = sandbox[0].url.replace(/\/$/, '');
				// Request URL
				requestURL(bot.domain, sandbox[0]);
			});
		}

		// Issue a request to the URL saved in the redis database for this bot
		getBot(successCallback);
	}

};