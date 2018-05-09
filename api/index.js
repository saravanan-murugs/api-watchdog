var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require('diskdb');
const fs = require('fs');
var cron = require('../cron');
var postmanutil = require('../postmanutil');
db = db.connect('./db', ['apis','environments']);
var jsonParser = bodyParser.json({limit: '50mb'});


// API details apis
// define the home page route
router.get('/apis', function (req, res) {
 let arr = db.apis.find(); 
  res.send(arr);
})


router.post('/postman/import', jsonParser, function (req, res) {
  postmanutil.insertMasterCollectoion(req.body,req.query.environment);  
  cron.scheduleNewAPICheck();
  res.send({status:'success'});
 })

router.post('/apis', jsonParser,function (req, res) {
  console.log(JSON.stringify(req.body));
  if(!req.body.name){
    res.status(400).send({error:"api name required"});
  }else if(!req.body.url){
    res.status(400).send({error:"api url required"});
  }else{ 
    postmanutil.insertSingleApi(req.body);
    cron.scheduleNewAPICheck();
    res.send({status:"success"});
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