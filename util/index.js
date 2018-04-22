const waterfall = require('async-waterfall');
const http = require('http');
const https = require('https');
const net = require('net');
const url = require('url');
const buffer = require('buffer').Buffer;

const httpGetCall = (opt, callback)=>{
  let httpAssigned;
  if(opt.protocol && opt.protocol === "https:"){
    httpAssigned =  https;
  }else{
    httpAssigned =  http;
  }
  delete opt.protocal;
  const req = httpAssigned.request(opt, (res) => {
    res.setEncoding('utf8');
    let rbody = "";
    res.on('data', (chunk) => {
      rbody += chunk;
    });
    res.on('end', () => {
      const response =  {body:rbody,error: null, httpCode: res.statusCode, httpMessage: res.statusMessage};
      callback(response)
    });
  });
  req.on('error', (e) => {
    const response =   {httpCode:0, httpMessage:"", error:e, body: null}
    callback(response);
  }).end();
}

const httpPostCall = (opt, callback)=>{
  console.log(opt.protocol);
  let reqOpt = {
    hostname: opt.hostname,
    port: opt.port,
    method: "POST",
    path:opt.path,
    headers :opt.headers,
    rejectUnauthorized : opt.rejectUnauthorized
  }
  console.log("+++++++++++Postig Data+++++++++++++++");
  console.log(JSON.stringify(reqOpt));
  let data;
  if(reqOpt.headers["content-type"] && reqOpt.headers["content-type"] === 'multipart/form-data'){
      const crlf = "\r\n",
      boundary = '---------------------------10102754414578508781458777923', // Boundary: "--" + up to 70 ASCII chars + "\r\n"
      delimiter = crlf + "--" + boundary,
      preamble = "", // ignored. a good place for non-standard mime info
      epilogue = "", // ignored. a good place to place a checksum, etc
      headers = [
        'Content-Disposition: form-data; name="file"; filename="one-apigee.zip"' + crlf,
        'Content-Type: application/x-zip-compressed' + crlf,
      ],
      //bodyPart = headers.join('') + crlf + data.toString(),
      //encapsulation = delimiter + crlf + bodyPart,
      closeDelimiter = delimiter + "--";
      let multipartBody;
      const begBuf = new buffer(preamble + delimiter + crlf + headers.join('') + crlf);
      const endBuf = new buffer(closeDelimiter + epilogue)
      const tBufLength = begBuf.length+opt.data.length+endBuf.length;
      multipartBody = buffer.concat([begBuf,opt.data, endBuf], tBufLength);
      console.log(endBuf.length);
      data = multipartBody;
      reqOpt.headers["content-length"] = data.length;
      reqOpt.headers["content-type"] = "multipart/form-data; boundary="+boundary;
  }else{
    data = opt.data;
    reqOpt.headers["content-length"] = data.length;
  }
  if(opt.protocol && opt.protocol === "https:"){
    httpAssigned =  https;
  }else{
    httpAssigned =  http;
  }
  delete opt.protocol;
  const req = httpAssigned.request(reqOpt, (res) => {
    res.setEncoding('utf8');
    let rbody = "";
    res.on('data', (chunk) => {
      rbody += chunk;
    });
    res.on('end', () => {
      const response =  {body:rbody,error: null, httpCode: res.statusCode, httpMessage: res.statusMessage};
      console.log("++++++++++>"+JSON.stringify(response));
      callback(response)
    });
  });
  req.on('error', (e) => {
    const response =   {httpCode:0, httpMessage:"", error:e, body: null}
    callback(response);
  });
  req.write(data);
  req.end();

}


const validateConfigFile = (config) =>{
  let jConfig;
  try{
    jConfig = JSON.parse(config);
  }catch(err){
    return {isValid:false,error : "Invalid config file. JSON parsing failed"};
  }
  if(jConfig.API){
    if(jConfig.API instanceof Array){

    }else{
      return {isValid:false,error : "API object should be array"};
    }
  }else{
    return {isValid:false,error : "API object is missing"};
  }
}

module.exports = {
  httpGetCall : httpGetCall,
  httpPostCall : httpPostCall
}
