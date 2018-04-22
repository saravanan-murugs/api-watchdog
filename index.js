const fs = require('fs');
var cron = require('./cron');
var api = require('./api')
// Set some defaults (required if your JSON file is empty)

//db.get('apis')
const express = require('express')
const app = express()
app.use(express.static('view'))

app.use("/api",api)

app.listen(3000, () => console.log('Example app listening on port 3000!'))