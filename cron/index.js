var cron = require('node-cron');
var db = require('diskdb');
const fs = require('fs');
db = db.connect('./db', ['apis']);
const apiUtil = require('../api-status');
const defaultFrequency = '*/1 * * * *';
// Get all apis object
const apis = db.apis.find();
var cronTasks = [];
for(var i=0;i<apis.length;i++){
    let tmp = apis[i];
    let cronTmp ={};
    if(tmp.frequency){
        cronTmp=  cron.schedule(tmp.frequency, function(){
            apiUtil.getAPIStatusGeneric(tmp,(err,resp)=>{
                tmp.serverStatus = resp.status;
                tmp.serverStatusMessage = resp.statusMessage;
                tmp.hcResponse = resp.hcResponse;
                db.apis.update({_id:tmp._id},tmp,{upsert:true});
            });
        }).start();
    }else{
        cronTmp =   cron.schedule(defaultFrequency, function(){
            apiUtil.getAPIStatusGeneric(tmp,(err,resp)=>{
                tmp.serverStatus = resp.status;
                tmp.serverStatusMessage = resp.statusMessage;
                tmp.hcResponse = resp.hcResponse;
                db.apis.update({_id:tmp._id},tmp,{upsert:true});
            });
        });
    }
    cronTasks.push(cronTmp);
}

let scheduleNewAPICheck = (apiObj)=>{
    let cronTmp =   cron.schedule(defaultFrequency, function(){
        apiUtil.getAPIStatusGeneric(apiObj,(err,resp)=>{
            apiObj.serverStatus = resp.status;
            apiObj.serverStatusMessage = resp.statusMessage;
            apiObj.hcResponse = resp.hcResponse;
            db.apis.update({_id:apiObj._id},apiObj,{upsert:true});
            console.log(JSON.stringify(resp));
        });
    });
    cronTasks.push(cronTmp);
}

module.exports = {
    scheduleNewAPICheck : scheduleNewAPICheck
}