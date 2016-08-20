var fs = require('fs');
var request = require('request');

var urlOrigen = 'http://www.genbeta.com/';
var urlRedirectExpected = 'http://m.genbeta.com/';
var useIntervals = true;
var timeoutBetweenIntervalsOfRequestInMs = 600;
var numberOfUrlsInInterval = 10;
var userAgentsFile = 'UserAgentsList.txt';

urlOrigen = process.argv[2] || urlOrigen;
urlRedirectExpected = process.argv[3] || urlRedirectExpected;
useIntervals = process.argv[4] || useIntervals;
timeoutBetweenIntervalsOfRequestInMs = process.argv[5] || timeoutBetweenIntervalsOfRequestInMs;
numberOfUrlsInInterval = process.argv[6] || numberOfUrlsInInterval;;
userAgentsFile = process.argv[7] || userAgentsFile;

var userAgentsList = readUserAgentsFromFile(userAgentsFile);

if (useIntervals === false) {
	CheckUserAgents(userAgentsList);
}
else {
	//Validate UserAgents in intervals to avoid { [Error: connect ETIMEDOUT] code: 'ETIMEDOUT', errno: 'ETIMEDOUT', syscall: 'connect' }
	var i = 0;
	var userAgentsListInterval;
	while (userAgentsList.length > 0)
	{
		i++;
		userAgentsListInterval = userAgentsList.splice(0,numberOfUrlsInInterval);
		setTimeout(CheckUserAgents.bind(null,userAgentsListInterval), timeoutBetweenIntervalsOfRequestInMs * i );	
	}
}



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
		if (line.indexOf('--') === -1)
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
								UrlActual: response.request.uri.href,
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