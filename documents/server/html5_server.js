const express = require("express");
const https = require("https");
const proxy = require("http-proxy-middleware").createProxyMiddleware;
const path = require("path");
const fs = require("fs");
const app = express();

const htmlTarget = 'http://localhost:7456';
const apiPaths = [
	"/vas",
	"/v1/vgift/service",
	"/vgiftv2",
	"/vCenter",
	"/center"
]
const proxyApi = false;
const apiTarget = 'https://test-bizgame.immomo.com';


// // 启动本地代理服务
// app.use((req, res, next) => {
// 	res.header("Access-Control-Allow-Origin", "http://local.m.immomo.com:7456");
// 	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// 	res.header("Access-Control-Allow-Credentials", "true");
// 	res.header("Access-Control-Allow-Methods", 'POST, GET, OPTIONS')
// 	next();
// });

// app.use(express.static('./static/'));

function sendHttpGetRequest(request, response) {

	const options = {
		hostname: 'img.momocdn.com',
		path: request.baseUrl,
		method: 'GET'
	}

	var req = https.request(options, function (res) {
		res.on('data', function (chunk) {
			response.write(chunk);
		});

		res.on("end", function () {
			response.end();
		});
	});

	req.on('error', function (e) {
		console.log('problem with request: ' + e.message);
	});

	req.end();
}
function checkRequestPath(path){
	for (let index = 0; index < apiPaths.length; index++) {
		const apiPath = apiPaths[index];
		if (path.startsWith(apiPath)){
			return true;
		}
	}
	return false;
}

const htmlProxy = proxy({
	target: htmlTarget,
	changeOrigin: true,
});
const apiProxy = proxy({
	target: apiTarget,
	changeOrigin: true,
});


app.use("/*", (req, res, next) => {
	const baseUrl = req.baseUrl;
	if (checkRequestPath(baseUrl)) {//todo
		if (proxyApi){
			apiProxy(req, res, next);
		}else{
			let pathUrl = path.join(__dirname, `../mocker/${baseUrl}`) + ".json";
			console.log(pathUrl);
			fs.readFile(pathUrl, "utf8", (err, buf) => {
				setTimeout(() => {
					res.send(`${buf}`);
				}, Math.random() * 1000);
			});
		}

	} else if (baseUrl.startsWith("/album")) {
		sendHttpGetRequest(req, res);
	} else {
		htmlProxy(req, res, next);
	}
});
var port = 7788;
app.listen(port);

console.log("html5_server listen to " + port);
