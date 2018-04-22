//var express = require('express');
//var request = require('request');
const waterfall = require('async-waterfall');
const http = require('http');
const net = require('net');
const url = require('url');

//curl http://<host>:<port>/v1/servers/self/up

//management server  curl http://localhost:8080/v1/servers/self/up

// router curl http://localhost:8081/v1/servers/self/up

// message processor curl http://localhost:8082/v1/servers/self/up

// qpid server curl http://<qpid_IP>:8083/v1/servers/self/up

// pstgress server curl http://<postgres_IP>:8084/v1/servers/self/up

//postgress health curl http://localhost:8084/v1/servers/self/health/

// curl -v -u QA_SRF_APIGEE_ADMIN@ucles.internal:HNFU9F8zzQ http://<host>:<port>/v1/servers?pod=gateway&region=dc-1

function GetStatus(){
	this.cmpStatus = [];
	this.getCMPStatus = (opt,callback) => {
		const self = this;
	if(this.cmpStatus === undefined){
		this.cmpStatus=[];
	}
	if(opt.length ===0){
		callback(this.cmpStatus);
	}else{
		const req = http.request(opt[opt.length-1], (res) => {
			res.setEncoding('utf8');
			let rbody = "";
			res.on('data', (chunk) => {
			rbody += chunk;
			});
			res.on('end', () => {
				if(rbody === 'true'){
					this.cmpStatus.push({ isUp : true, message:"", opt: opt[opt.length-1]});
				}else{
					this.cmpStatus.push({ isUp : false, message:"", opt: opt[opt.length-1]});
				}
				opt.splice(opt.length-1,1);
				self.getCMPStatus(opt,callback);
			});
		});
		req.on('error', (e) => {
			this.cmpStatus.push( { isUp : true, message:e.message, opt: opt[opt.length-1]});
			opt.splice(opt.length-1,1);
			self.getCMPStatus(opt,callback);
		}).end();
	}
}
}

const getComponentStatus = (opt, cb) =>{
	waterfall([
  (callback)=>{
	const tmp = new GetStatus();
	tmp.getCMPStatus(opt.ms,(cmpStatus)=>{
			let status  = {};
			status.MS = cmpStatus;
			callback(null,status);
		})
  }, (status,callback)=>{
	const tmp = new GetStatus();
	tmp.getCMPStatus(opt.rtr,(cmpStatus)=>{
			status.RTR = cmpStatus;
			callback(null,status);
		})
  },
  (status, callback)=>{
	 const tmp = new GetStatus();
	tmp.getCMPStatus(opt.mp,(cmpStatus)=>{
			status.MP = cmpStatus;
			callback(null,status);
		})
  },
  (status,callback)=>{
	const tmp = new GetStatus();
	tmp.getCMPStatus(opt.qs,(cmpStatus)=>{
			status.QS = cmpStatus;
			callback(null,status);
		})
  },
  (status, callback)=>{
	const tmp = new GetStatus();
	tmp.getCMPStatus(opt.ps,(cmpStatus)=>{
			status.PS = cmpStatus;
			callback(null,status);
		})
  }
],(err, status) =>{
		cb(status);
});
}

module.exports  = getComponentStatus;
