//var express = require('express');
//var request = require('request');
const fs = require('fs');
const waterfall = require('async-waterfall');
const cs = require('./component-status');
const apiUtil = require('./api-status');
const util =  require('./util');
const schedule = require('node-schedule');
const express = require('express');
const app = express();
const config = JSON.parse(fs.readFileSync("configuration.json"));
const opt = {ms:config.MS,rtr:config.RTR,mp:config.MP,qs:config.QS,ps:config.PS};
/*
cs(opt, (compStatus)=>{
	var js = JSON.stringify(compStatus, null, '\t');
	fs.writeFileSync("output.json", js, 'utf-8');
});*/
console.log("detecting configuraiton.json");
if(!fs.existsSync("./one-apigee-temp.json")){
	throw {"error" : "configuraiton.json file is missing"};
}
console.log("detecting one-apigee-temp.json");
if(!fs.existsSync("./one-apigee-temp.json")){
	fs.writeFileSync("./one-apigee-temp.json", {"envSetupDone":false});
}

let oneTemp = fs.readFileSync('./one-apigee-temp.json');
oneTemp = JSON.parse(oneTemp);

let heartbeatJob;

waterfall([
	(callback)=>{
		if(!oneTemp.envSetupDone){
			let copt = config.API[0];
			let pOpt = {
				"host":copt.msHostname,
				"port":copt.msPort,
				"authorization" : copt.msAuthorization,
				"org":copt.org,
				"env":copt.env
			}
			apiUtil.setPrerequisites(pOpt,(err, status)=>{
				if(status){
					callback(null);
				}else{
					callback(err,null);
				}
			})
		}
	},
	(callback)=>{
		heartbeatJob = schedule.scheduleJob('*/2 * * * *', function(){

		});
	}
],(err,result)=>{

})

const apiOpt = {
		  "hostname": "10.114.41.38",
		  "port": 8080,
		  //"path": "/v1/one-apigee/token?grant_type=client_credentials",
		 // "method": "GET",
		  "headers":{
				"Authorization" :"Basic QXZjNUIwM2FveEI3cVlpbjFtcW83WmozQkRIWGxTdHg6NWRkTU01RDZtZUdBbWh0dg=="
		  }
		}

//api("10.114.41.38",8080,"caorg","one_apigee",(rs)=>{console.log(rs)});
//opt.msHost,opt.msPort,opt.org,opt.msAuthorization
 const pOpt = {
	 "msHost":"10.114.41.38",
	 "msPort" : 8080,
	 "org" : "caorg",
	 "msAuthorization" : "Basic bXVydWdzQHVjbGVzLmludGVybmFsOlRoYnMxMjM0",
	 "env":"prod",
	 "apiHost":"10.114.41.38",
	 "apiPort":"9001"
 }


var j = schedule.scheduleJob('*/1 * * * *', function(){
  console.log('Today is recognized by Rebecca Black!');
});


app.get('/', (req, res) => res.send('Hello World!'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))
/*
util.httpCall(apiOpt, (res)=>{
	console.log(res.body);
	console.log(res.httpCode);
	console.log(res.httpMessage);
})*/
