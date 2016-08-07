var fs = require('fs');
var request = require('request');

var urlOrigen = 'http://www.genbeta.com/';
var urlRedirectExpected = 'http://m.genbeta.com/';
var userAgentsFile = 'UserAgentsList.txt';

urlOrigen = process.argv[2] || urlOrigen;
urlRedirectExpected = process.argv[3] || urlRedirectExpected;
userAgentsFile = process.argv[4] || userAgentsFile;

var userAgentsList = readUserAgentsFromFile(userAgentsFile);
CheckUserAgents(userAgentsList);


function readUserAgentsFromFile(filename){
	var userAgentsList = [];
	var fileContents = fs.readFileSync(filename);
	var lines = fileContents.toString().split('\n');
	var partsLine;
	var line;
	var i;
	var linesLength = lines.length;


	for (i = 0; i < linesLength; i++) {
		line = lines[i].toString();
		if (!line.includes('--'))
		{
			partsLine = lines[i].toString().split('#');
			userAgentsList.push({
							Device: partsLine[0], 
							UserAgent: partsLine[1].replace('\r', '')
			});
		}
	}
	return userAgentsList;
};

function CheckUserAgents(userAgentsList){
	var	currentUserAgent;
	var i;
	var maxUserAgents;
					
	maxUserAgents = userAgentsList.length;

	for (i=0; i<maxUserAgents; i++) {
		currentUserAgent =  userAgentsList[i];

		(function (currentUserAgentAsync){
			request({
				url: urlOrigen,
				headers: {
					'User-Agent':  currentUserAgentAsync.UserAgent.toString()
				}},
				function (error, response, body) {
					var isRedirect;
					var result;
					if (!error) {
						isRedirect = urlRedirectExpected == response.request.uri.href;
						
						if (!isRedirect) {
							result = {
								StatusCode: response.statusCode,
								Url: response.request.uri.href,
								UrlExpected: urlRedirectExpected,
								Device: currentUserAgentAsync.Device,
								UserAgent: currentUserAgentAsync.UserAgent
							};
							console.log(result);
							console.log('\r\n');
						}
					}
					else {

						console.log('ERROR');
						console.log('----------------------------------');
						console.log(error);
						console.log('----------------------------------');
					}
				})
			})(currentUserAgent);	
	}
}