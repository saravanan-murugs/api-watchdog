var fs = require('fs');
const url = require('url');
var db = require('diskdb');
db = db.connect('./db', ['apis','environments']);
const normalizePostmanCollection = (collection)=>{
    let self = [];
    console.log("after  >> "+self);
    if(collection.item && collection.item.length>0){
      for(let i=0;i<collection.item.length;i++){
        if(collection.item[i].request){
          self.push(collection.item[i]);
        }else if(collection.item[i].item && collection.item[i].item.length > 0 ){
          let tmpSelf = collection.item[i].item;        
            for(let j=0;j<tmpSelf.length;j++){
              if(tmpSelf[j].request){
                self.push(tmpSelf[j])  
              }
            }
        }
      }
    }
    return self;
}

const insertMasterCollectoion = (collection,environment)=>{
    let map = normalizePostmanCollection(collection);
    var mc = JSON.parse(fs.readFileSync("./postmancollections/master-collection.json"));
    for(let i=0;i < map.length;i++){
      let api = mapPostmanAPItoAPI(map[i]);
      api.environment = environment;
      api = db.apis.save(api);
      map[i].id = api._id;
      mc.item.push(map[i]);
    }    
    fs.writeFileSync('./postmancollections/master-collection.json',JSON.stringify(mc));
}

const insertSingleApi = (viewApi)=>{
  var mc = JSON.parse(fs.readFileSync("./postmancollections/master-collection.json"));
  var api = mapViewAPItoAPI(viewApi);
  api = db.apis.save(api);
  viewApi.id = api._id;
  console.log(JSON.stringify(viewApi));
  mc.item.push(mapAPItoPostmanAPI(viewApi));
  fs.writeFileSync('./postmancollections/master-collection.json',JSON.stringify(mc));
}

const mapViewAPItoAPI = (vApi)=>{
  var api ={
    url:vApi.url,
    name:vApi.name,
    status:[            
    ],
    environment:vApi.environment
  }
  return api;
}
const mapPostmanAPItoAPI = (postAPI) =>{
  console.log(postAPI)
  var api ={
        url:"",
        name:postAPI.name,
        status:[            
        ],
        environment:""
    }
    if(postAPI.request.url.raw){
      api.url = postAPI.request.url.raw;
    }else{
      api.url = postAPI.request.url;
    }
    return api;
}


// {
//   isUp : false,
//   response:{
//     statusCode: 0,
//     statusMessage: "",
//     payload:"",
//     errorDescription:""
//   },
//   timestamp:""
// } 

const mapAPItoPostmanAPI = (api)=>{
  var pObj = {
    "name": "",
    "id":"",
    "request": {
      "method": "",
      "header": [],
      "body": {
        
      },
      "url": ""
    },
    "response": [ ]
  }

  pObj.name = api.name
  // TODO:
  pObj.request.url = api.url
  pObj.request.method = api.method;
  if(api.body){
    pObj.request.header.push({key:"Content-Type",value:api.contentType});
    pObj.request.body.raw = api.body;
    pObj.request.mode = raw;
  }
  pObj.id = api.id;
  return pObj;
}

module.exports = {
    insertMasterCollectoion : insertMasterCollectoion,
    insertSingleApi:insertSingleApi
}
  
