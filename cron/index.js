var cron = require('node-cron');
var db = require('diskdb');
const fs = require('fs');
var newman = require('newman');
db = db.connect('./db', ['apis']);
const apiUtil = require('../api-status');
const defaultFrequency = '*/2 * * * *';
// Get all apis object
const apis = db.apis.find();
cronTasks=  cron.schedule(defaultFrequency, function(){
    newman.run({
        collection: './postmancollections/master-collection.json',
        reporters: ['cli','teamcity']
    }, (error, summary )=>{
        for(let i=0;i<summary.run.executions.length;i++){
            let tmp = summary.run.executions[i];
            let status = {};
            status.timestamp = summary.run.timings.started;
            if(tmp.response && tmp.response.code){
                status.statusCode =  tmp.response.code;
                status.statusMessage =tmp.response.status;
                console.log("adfaf"+JSON.stringify(tmp.response.stream))
                if(tmp.response.stream.data && tmp.response.stream.data.length >0){
                    let dbuf = Buffer.from(tmp.response.stream.data);
                    status.payload = dbuf.toString('utf8');
                }else{
                    status.payload = "";
                }
            }else if(tmp.requestError && tmp.requestError.code){
                status.statusCode =  tmp.requestError.code;
                status.statusMessage ="N/A";
                status.payload = "";
            }    
            api = db.apis.findOne({_id:tmp.item.id })
            if(api.status.length ===0){
                api.status.push(status);
            }else if((status.timestamp - api.status[api.status.length-1].timestamp) > 600000){
                if(api.status.length>=10){
                    api.status.splice(0, 1);
                }
                api.status.push(status);
            }else if((status.statusCode === api.status[api.status.length-1].statusCode 
                && status.payload === api.status[api.status.length-1].payload)){
                    
            }else if(status.statusCode !==200 ){
                status.timestamp = api.status[api.status.length-1].timestamp;
                if(api.status.length>=10){
                    api.status.splice(0, 1);
                }
                api.status.push(status);
            }
            api.currentStatus = (status.statusCode === 200)?true:false;
            db.apis.update({_id:tmp.item.id }, api, {multi: false,upsert: true});    
        }
    });
});
cronTasks.start();

let scheduleNewAPICheck = ()=>{
    cronTasks.destroy()
    cronTasks=  cron.schedule(defaultFrequency, function(){
        newman.run({
            collection: './postmancollections/master-collection.json',
            reporters: ['cli']
        }, (error, summary )=>{
            //fs.writeFileSync("error.json", JSON.stringify(error));
            //fs.writeFileSync("summary.json", JSON.stringify(summary));
            for(let i=0;i<summary.run.executions.length;i++){
                let tmp = summary.run.executions[i];
                let status = {};
                status.timestamp = summary.run.timings.started;
                if(tmp.response && tmp.response.code){
                    status.statusCode =  tmp.response.code;
                    status.statusMessage =tmp.response.status;
                    if(tmp.response.stream.data && tmp.response.stream.data.length >0){
                        let dbuf = Buffer.from(tmp.response.stream.data);
                        status.payload = dbuf.toString('utf8');
                    }else{
                        status.payload = "";
                    }
                }else if(tmp.requestError && tmp.requestError.code){
                    status.statusCode =  tmp.requestError.code;
                    status.statusMessage = "N/A";
                    status.payload = "";
                }   
                api = db.apis.findOne({_id:tmp.item.id})
                if(api.status.length ===0){
                    api.status.push(status);
                }else if((status.timestamp - api.status[api.status.length-1].timestamp) > 600000){
                    if(api.status.length>=10){
                        let sAr = api.status.splice(0, 1);
                        sAr.push(status);
                        api.status = sAr;
                    }else{
                        api.status.push(status);
                    }
                }else if((status.statusCode === api.status[api.status.length-1].statusCode 
                    && status.payload === api.status[api.status.length-1].payload)){
                        
                }else if(status.statusCode !==200 ){
                    status.timestamp = api.status[api.status.length-1].timestamp;
                    if(api.status.length>=10){
                        let sAr = api.status.splice(0, 1);
                        sAr.push(status);
                        api.status = sAr;
                    }else{
                        api.status.push(status);
                    }
                }
                api.currentStatus = (status.statusCode === 200)?true:false;
                db.apis.update({_id:tmp.item.id }, api, {multi: false,upsert: true});    
            }
        });
    });
    cronTasks.start();
}

module.exports = {
    scheduleNewAPICheck : scheduleNewAPICheck
}