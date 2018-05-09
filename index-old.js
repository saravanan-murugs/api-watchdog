var util = require('./util');
var fs = require('fs');
var url = require('url');
// var collection = JSON.parse(fs.readFileSync('./SnAPI.postman_collection.json'))
// //var collection = JSON.parse(fs.readFileSync('./Systopia.postman_collection.json'))

// console.log(collection.item.length)

// var map = util.normalizePostmanCollection(collection,[]);

// fs.writeFileSync('./output.json',JSON.stringify(map))

// console.log(map.length);

var obj = url.parse("https://www.goog.comv1/people/assessor?type=DATE_RANGE&startDateTime=2016-12-01T00:00:01&endDateTime=2017-06-01T00:00:01&aspUid&lastName&firstName&emailId&dob&gender&page&limit=1")

console.log(JSON.stringify(obj.query));