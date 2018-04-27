const waterfall = require('async-waterfall');
const http = require('http');
const net = require('net');
const url = require('url');
const util = require('../util');
var formdata = require('form-data');
var fs = require('fs');
var jp = require('jsonpath');
const Buffer = require('buffer').Buffer;

const getDeveloper = (host, port, org, authorization, callback) =>{
	const reqOpt = {
		hostname:host,
		port: port,
		path: "/v1/organizations/"+org+"/developers/developer@one-apigee.com",
		headers:{
			'Authorization':authorization
		}
	}
	util.httpGetCall(reqOpt, (resp)=>{callback(resp);});
}

const createDeveloper = (host, port, org, authorization, callback) =>{
	let developerConfig = {
		"email" : "developer@one-apigee.com",
 		"firstName" : "developer",
		"lastName" : "one-apigee",
		"userName" : "developer@one-apigee.com",
		"attributes" : []
	}
	const reqOpt = {
		hostname:host,
		port: port,
		path: "/v1/organizations/"+org+"/developers",
		headers:{
			'content-type':"application/json",
			'Authorization':authorization
		},
		data:JSON.stringify(developerConfig)
	};
	util.httpPostCall(reqOpt, (resp) =>{
		callback(resp);
	})
}

const getDevApp = (host, port, org, authorization, callback) =>{
	const reqOpt = {
		hostname:host,
		port: port,
		path: "/v1/organizations/"+org+"/developers/developer@one-apigee.com/apps/one-apigee-developer-app",
		headers:{
			'Authorization':authorization
		}
	}
	util.httpGetCall(reqOpt, (resp)=>{callback(resp);});
}

const createDevApp = (host, port, org, authorization, callback) =>{
	let appConfig = {
		"name" : "one-apigee-developer-app",
		"apiProducts": [ "one-apigee-product" ],
		"keyExpiresIn" : -1,
		"attributes" : [
			{
				"name" : "DisplayName",
				"value" : "one-apigee-developer-app"
			}
		],
		"callbackUrl" : "https://sample.com/"
	}
	const reqOpt = {
		hostname:host,
		port: port,
		path: "/v1/organizations/"+org+"/developers/developer@one-apigee.com/apps",
		headers:{
			'content-type':"application/json",
			'Authorization':authorization
		},
		data:JSON.stringify(appConfig)
	}
	util.httpPostCall(reqOpt, (resp) =>{
		callback(resp);
	})
};

const getAPIProduct = (host, port, org, authorization, callback) =>{
	const reqOpt = {
		hostname:host,
		port: port,
		path: "/v1/organizations/"+org+"/apiproducts/one-apigee-product",
		headers:{
			'Authorization':authorization
		}
	}
	util.httpGetCall(reqOpt, (resp)=>{callback(resp);});
};

const createAPIProduct = (host, port, org, env, authorization, callback) =>{
	let productConfig = {
	  "name" : "one-apigee-product",
	  "displayName": "one-apigee-product",
	  "approvalType": "auto",
	  "attributes": [
	    {
	      "name": "access",
	      "value": "internal"
	    }
	  ],
	  "description": "One-apigee product for monitoring Heart beat API",
	  "environments": [env],
	  "proxies": ["one-apigee"],
	  "quota": "20",
	  "quotaInterval": "1",
	  "quotaTimeUnit": "minute"
	}
	const reqOpt = {
		hostname:host,
		port: port,
		path: "/v1/organizations/"+org+"/apiproducts",
		headers:{
			'content-type':"application/json",
			'Authorization':authorization
		},
		data:JSON.stringify(productConfig)
	}
	util.httpPostCall(reqOpt, (resp) =>{
		callback(resp);
	})
}

const uploadAPIproxy = (host,port,org,authorization,callback)=>{
	const reqOpt = {
		hostname:host,
		port: port,
		path: "/v1/organizations/"+org+"/apis?action=import&name=one-apigee&validate=false",
		headers:{
			'content-type':"multipart/form-data",
			'Authorization':authorization
		},
		data:fs.readFileSync("./resources/one-apigee.zip")
	}
	util.httpPostCall(reqOpt, (resp)=>{
			callback(resp);
	})

}

const deployAPIProxy = (host,port,org,env,authorization,callback)=>{
	const reqOpt = {
		hostname:host,
		port: port,
		path: "/v1/organizations/"+org+"/environments/"+env+"/apis/one-apigee/revisions/2/deployments?override=true",
		headers:{
			'content-type':"application/x-www-form-urlencoded",
			'Authorization':authorization
		},
		data:""
	}
	util.httpPostCall(reqOpt, (resp)=>{
			callback(resp);
	})
}

const isAPIExist = (host,port,org,api,authorization,callback) =>{
	const opt = {
		"hostname": host,
		"port": port,
		"path":"/v1/organizations/"+org+"/apis/"+api,
		"method": "GET",
		"headers":{
			"Authorization" :authorization
		}
	}
	util.httpGetCall(opt, (resp)=>{
		const jso = JSON.parse(resp.body);
		if(jso.name){
			callback(true);
		}else{
			callback(false);
		}
	});
}

const callOneApigeeApi = (host, port, authorization, callback) =>{
	const reqOpt = {
		hostname: host,
		port: port,
		headers :{
			"Authorization" : authorization
		},
		path: "/v1/one-apigee/token?grant_type=client_credentials"
	}
	util.httpGetCall(reqOpt,(resp)=>{
			callback(resp);
	});
}
const getAPIStatus = (opt, cb) => {
	waterfall([
		/*(callback)=>{
			const optPreq = {
		 	 "host":opt.msHost,
		 	 "port" : opt.msPort,
		 	 "org" : opt.org,
		 	 "authorization" : opt.msAuthorization,
		 	 "env":opt.env
		 };
			setPrerequisites(optPreq,(err, status)=>{
				if(status === true){
					getDevApp(opt.msHost,opt.msPort,opt.org,opt.msAuthorization, (gdaResp)=>{
						if(gdaResp.httpCode === 200){
							let gdaJson = JSON.parse(gdaResp.body);
							callback(null, gdaJson.credentials[0].consumerKey, gdaJson.credentials[0].consumerSecret);
						}
					})
				}else{
					callback({"error":"pre requisites failed"});
				}
			})
		},*/
		(callback)=>{
			getDevApp(opt.msHost,opt.msPort,opt.org,opt.msAuthorization, (gdaResp)=>{
				if(gdaResp.httpCode === 200){
					let gdaJson = JSON.parse(gdaResp.body);
					callback(null, gdaJson.credentials[0].consumerKey, gdaJson.credentials[0].consumerSecret);
				}else{
					if(!gdaResp.error){
						let gdaJson = JSON.parse(gdaResp.body);
						if(gdaJson.code === "datastore.ErrorWhileAccessingDataStore"){
							callback({error:"get dev app failed"},{compStatus:{cassandra: false}});
						}
					}else{
							callback({error:"get dev app failed"},{compStatus:{}});
					}
				}
			})
		},
		(clientId, clientSecret, callback)=> {
			const auth = "Basic "+new Buffer(clientId+":"+clientSecret).toString('base64');
			console.log(auth);
			callOneApigeeApi(opt.apiHost,opt.apiPort,auth,(resp)=>{
				if(resp.httpCode === 200){
					callback(null,{compStatus:{cassandra:true}})
				}else{
					callback(null,{compStatus:{cassandra:false}})
				}
			});
		}
	],(err, result)=>{
		cb(err, result);
	});
}


/*
Description : Set the required pre
opt
{
"host": management api host
"port": management api port
"org" : organisation for which heart beat check is done
"env" : environment on which heart beat api will be deployed
"authorization" : management api credentials
}

*/
const setPrerequisites = (opt , cb) => {
	waterfall([
		(callback)=>{
			// TODO: Add logging
			console.log("Initiating one apigee prerequisites setup ..");
			console.log("Checking if one-apigee proxy available ..");
			isAPIExist(opt.host, opt.port, opt.org, "one-apigee",opt.authorization, (apiStatus)=>{
				if(apiStatus){
					console.log("one-apigee proxy is available");
				}else{
					console.log("one-apigee proxy is not available");
				}
				callback(null, apiStatus)
			});
		},
		(apiStatus, callback)=>{
			if(apiStatus){
				callback(null);
			}else{
				///v1/organizations/adsf/apis?action=import&name=23&validate=12
				console.log("uploading one-apigee apigee proxy");
				uploadAPIproxy(opt.host, opt.port, opt.org,opt.authorization,(upRes)=>{
					let jRes = JSON.parse(upRes.body);
					if(upRes.httpCode === 201){
						///v1/organizations/adsf/environments/{env_name}/apis/{api_name}/revisions/{revision_number}/deployments
						// TODO : Add logging
						deployAPIProxy(opt.host, opt.port, opt.org,opt.env,opt.authorization,(depRes)=>{
							console.log("deploying one-apige proxy");
							 if(depRes.httpCode === 200){
								 // TODO : Add Loggin
								 console.log("one-apigee proxy deployment successfull");
								 callback(null);
							 }else{
								 // TODO : Add Logging
								 console.log("one-apigee proxy deployment failed");
								 callback({errorMessage : "one-apigee uploaded but deployment failed",error:depRes.error}, depRes);
							 }
						});
					}else{
						// TODO : Add Logging
						console.log("one-apigee proxy upload failed");
						callback({errorMessage : "one-apigee uploaded failed",error:upRes.error}, upRes);
					}
				})

			}
		},
		(callback)=>{
			//TODO: Add Logging
			console.log("checking for one-apigee product");
			getAPIProduct(opt.host, opt.port, opt.org,opt.authorization,(gpResp)=>{
				if(gpResp.httpCode === 404){
					//TODO: Add Logging
					console.log("one-apigee products is not available");
					console.log("creating one-apigee product");
					createAPIProduct(opt.host, opt.port, opt.org, opt.env, opt.authorization,(capResp)=>{
						if(capResp.httpCode === 201){
							//TODO: Add Logging
							console.log("one-apigee product created succfully");
							callback(null)
						}else{
							callback({errorMessage : "one-apigee-product creation failed", error:capResp.error}, capResp)
						}
					})
				}else if(gpResp.httpCode === 200){
					//TODO: Add Logging
						callback(null)
				}else{
					// TODO: Add Logging
					callback({errorMessage : "one-apigee-product fetch failed", error:gpResp.error}, gpResp)
				}
			})
		},
		(callback) =>{
			// TODO: Add Logging
			getDeveloper(opt.host, opt.port, opt.org, opt.authorization,(gdResp)=>{
				if(gdResp.httpCode === 404){
					createDeveloper(opt.host, opt.port, opt.org, opt.authorization,(cdResp)=>{
						if(cdResp.httpCode === 201){
							callback(null);
						}else{
							callback({errorMessage : "one-apigee-developer creation failed", error:cdResp.error}, cdResp);
						}
					});
				}else if(gdResp.httpCode === 200){
					callback(null);
				}else{
					callback({errorMessage : "one-apigee-developer fetch failed", error:gdResp.error}, gdResp);
				}
			});
		},
		(callback) =>{
			// TODO: Add Logging
			getDevApp(opt.host, opt.port, opt.org, opt.authorization,(gdaResp)=>{
				if(gdaResp.httpCode === 404){
					createDevApp(opt.host, opt.port, opt.org, opt.authorization,(cdaResp)=>{
						if(cdaResp.httpCode === 201){
							callback(null);
						}else{
							callback({errorMessage : "one-apigee-developer-app creation failed", error:cdaResp.error}, cdaResp);
						}
					});
				}else if(gdaResp.httpCode === 200){
					console.log(gdaResp);
					callback(null);
				}else{
					callback({errorMessage : "one-apigee-developer-app fetch failed", error:gdaResp.error}, gdaResp);
				}
			});
		}
	],(err, res)=>{
		if(err){
			console.log("prerequist error");
			console.log(err);
			console.log(res);
			cb(err, false);
		}else{
			cb(null, true);
		}
	})
}

const getCleintCredentialToken = (reqObj, cb)=>{
	
	const urlObj = url.parse(reqObj.tokenUrl);
	let reqOpt = {};
	// determine and set hostname
	reqOpt.hostname = urlObj.hostname;
	// determine port
	let port = 0;
	if(urlObj.port){reqOpt.port = urlObj.port}
	else if(urlObj.protocol === 'https'){reqOpt.port=443}
	else{reqOpt.port=80};
	//determine and set protocol
	reqOpt.protocol = urlObj.protocol;
	// determine and set path
	reqOpt.path = urlObj.path;
	if(!reqObj.oAuthClientId){
		return cb({err:"oAuthClientId cannot be empty"})
	}
	if(!reqObj.oAuthClientSecret){
		return cb({err:"oAuthClientSecret cannot be empty"})
	}
	data = "grant_type=client_credentials&client_id="+
		reqObj.oAuthClientId+
	"&client_secret="+reqObj.oAuthClientSecret;
	if(reqObj.oAuthScope){
		data = data+"&scope="+reqObj.oAuthScope
	}
	reqOpt.data = data;
	util.httpPostCall(reqOpt, (resp)=>{
		if(resp.httpCode === 200){
			const tokenRes = JSON.parse(resp.body);
			return cb(null,tokenRes.access_token);
		}else{
			return cb({err:resp.error});
		}
	})
	//reqOpt.data = 
};

// Get API health. This function expects reqObj with all api details as follows.

// {
// 	"url": "https://xplan-api.ucles.internal:8080/json",
// 	"method": "POST",
// 	"data": "{\"method\":\"XPlanThirdPartyServices.UserLogin\",\"params\":{\"Username\":\"Api\",\"Password\":\")FYW3cqGGmOm\"}}",
// 	"requestContentType": "application/json",
// 	"requestAcceptType": "application/json",
// 	"statusCode": "200",
// 	"statusMessage": "OK",
// 	"responseContentType": "application/json",
// 	"expectedJsonPath": "",
// 	"expectedXpath": "",
// 	"authType": "none",
// 	"oAuthClientId": "",
// 	"oAuthClientSecret": "",
// 	"oAuthScope":"",
// 	"basicAuthString": "",
// 	"basicUsername": "",
// 	"basicPassword": "",
// 	"authorizationHeader": "",
// 	"frequency": "",
//	"rejectUnauthorized":false
//   }
const getAPIStatusGeneric = (reqObj, cb)=>{
	let reqOpt = {headers:{}};
	waterfall([
		(callback)=>{
			const urlObj = url.parse(reqObj.url);
			// determine and set hostname
			reqOpt.hostname = urlObj.hostname;
			// determine port
			let port = 0;
			if(urlObj.port){reqOpt.port = urlObj.port}
			else if(urlObj.protocol === 'https:'){reqOpt.port=443}
			else{reqOpt.port=80};
			//determine and set protocol
			reqOpt.protocol = urlObj.protocol;
			// determine and set path
			reqOpt.path = urlObj.path;
			//rejectUnauthorized
			if(reqObj.rejectUnauthorized === false){
				reqOpt.rejectUnauthorized = reqObj.rejectUnauthorized;
			}else{
				reqOpt.rejectUnauthorized = true;
			}			
			//Set headers
			if(reqObj.method === "POST"){
				reqOpt.headers["Content-Type"] = reqObj.requestContentType || "application/json";
			}
			reqOpt.headers["Accept"] = reqObj.requestAcceptType || "*/*";

			//Set Data for post methods
			if(reqObj.method === "POST"){
				if(reqObj.data){
					reqOpt.data = reqObj.data;
				}
			}

			// Determine authorization
			console.log("getting status for "+reqObj.url);
			if(reqObj.authType === "oauth2"){
				getCleintCredentialToken(reqObj,(err,token)=>{
					if(err){
						callback(null,{status:false,statusMessage:"Unable to get token :"+ err.toString()});
					}else{
						reqOpt.headers["Authorization"]="Bearer "+token;
						callback(null);
					}
				});
			}else if (reqObj.authType === "basic"){
				// TODO: add basic authorization functionality
				callback(null);
			}else{
				if(reqObj.authorizationHeader){
					reqOpt.headers["Authorization"]=reqObj.authorizationHeader;
				}
				callback(null);
			}	

		},
		(callback)=>{
			if(reqObj.method == "POST"){
				util.httpPostCall(reqOpt,(resp)=>{
					if(resp.error){
						callback(null,{status:false,statusMessage:resp.error.toString()});
					}else{
						var status = true;
						var statusMessage = "";
						if((reqObj.statusCode && resp.httpCode == reqObj.statusCode)
						||(!reqObj.statusCode && resp.httpCode == 200)){
							if((reqObj.statusMessage && resp.httpMessage === reqObj.statusMessage)
							|| (!reqObj.statusMessage && resp.httpMessage === "OK")){
								status =  true;
							}else{
								status =  false;
								console.log(reqObj.statusMessage+" ===="+ resp.httpMessage);
								statusMessage = "statusMessage did not match";
							}						
						}else{
							status =  false;
							statusMessage = "statusCode did not match";
						}
						if(reqObj.expectedJsonPath){
							let apires = JSON.parse(resp.body);
							let jsonPath = reqObj.expectedJsonPath;
							try{
								var jpResult = jp.query(apires, jsonPath);
								if(!jpResult){
									status =  false;
									statusMessage = "JSONpath did not match";
								}
							}catch(err){
								status =  false;
								statusMessage = "JSONpath did not match";
							}
						}
						callback(null,{status:status,statusMessage:statusMessage,hcResponse:resp});
					}
				})
			}else{
				util.httpGetCall(reqOpt,(resp)=>{
					var status = true;
					var statusMessage = "";
					if((reqObj.statusCode && resp.httpCode == reqObj.statusCode)
					||(!reqObj.statusCode && resp.httpCode == 200)){
						if((reqObj.statusMessage && resp.httpMessage === reqObj.statusMessage)
						|| (!reqObj.statusMessage && resp.httpMessage === "OK")){
							status =  true;
						}else{
							status =  false;
							statusMessage = "statusMessage did not match";
						}						
					}else{
						status =  false;
						statusMessage = "statusCode did not match";
					}
					if(reqObj.expectedJsonPath){
						let apires = JSON.parse(resp.body);
						let jsonPath = reqObj.expectedJsonPath;
						try{
							var jpResult = jp.query(apires, jsonPath);
							if(!jpResult){
								status =  false;
								statusMessage = "JSONpath did not match";
							}
						}catch(err){
							status =  false;
							statusMessage = "JSONpath did not match";
						}
					}
					callback(null,{status:status,statusMessage:statusMessage,hcResponse:resp});
				})
			}			
		}
	],(err, res)=>{
		if(err){
			console.log("prerequist error");
			console.log(err);
			console.log(res);
			cb(null, {status:false,statusMessage:"unknown error : "+err.toString()} );
		}else{
			cb(null, res);
		}
	})
	
};
module.exports  = {
	getDeveloper : getDeveloper,
	getAPIStatus : getAPIStatus,
	setPrerequisites : setPrerequisites,
	getAPIStatusGeneric : getAPIStatusGeneric	
}
