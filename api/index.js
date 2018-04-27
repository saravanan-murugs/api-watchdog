var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require('diskdb');
const fs = require('fs');
var cron = require('../cron');
db = db.connect('./db', ['apis','environments']);
var jsonParser = bodyParser.json({limit: '50mb'});


// API details apis
// define the home page route
router.get('/apis', function (req, res) {
 let arr = db.apis.find(); 
  res.send(arr);
})


router.post('/postman/import', jsonParser, function (req, res) {
  let arr = db.apis.find(); 
   res.send({status:'success'});
 })
/*

{
  "apiname": "MSS Login",
  "url": "",
  "method": "GET",
  "data": "",
  "requestContentType": "application/json",
  "requestAcceptType": "application/json",
  "statusCode": 200,
  "statusMessage": "OK",
  "responseContentType": "application/json",
  "expectedJsonPath": "",
  "expectedXpath": "",
  "authType": "none",
  "oAuthClientId": "",
  "oAuthClientSecret": "",
  "oAuthScope": "",
  "basicAuthString": "",
  "basicUsername": "",
  "basicPassword": "",
  "authorizationHeader": "",
  "frequency": "",
  "environment": "production",
  "rejectUnauthorized": true
}


*/

router.post('/apis', jsonParser,function (req, res) {
  console.log(JSON.stringify(req.body));
  if(!req.body.apiname){
    res.status(400).send({error:"api name required"});
  }else if(!req.body.url){
    res.status(400).send({error:"api url required"});
  }else if(db.environments.findOne({apiname:req.body.apiname})){
    res.status(400).send({error:"api already exists"});
  }else{  
    let apiObj = db.apis.save(req.body);
    cron.scheduleNewAPICheck(apiObj);
     res.send(apiObj);
  }
})

// Environment apis
/*
{
  name:"",
  _id:""
}
*/
router.get('/environments', function (req, res) {
  let arr = db.environments.find(); 
   res.send(arr);
})
router.post('/environments', jsonParser,function (req, res) {
  if(db.environments.findOne({name:req.body.name})){
    res.status(400).send({error:"environment already exists"});
  }else{
   let env = db.environments.save(req.body);
   res.send(env);
  }  
})
module.exports = router