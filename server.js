var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var axios = require('axios');
var querystring = require('querystring');

require('dotenv').config();

var bodyParser = require('body-parser');
app.use( bodyParser.json() );

var port = process.env.PORT || 3000;
app.use(express.static(__dirname));

app.get('/', function(req, res) {
  res.render('index');
});

var instance = axios.create({
  baseURL: 'https://api.imgur.com/3/',
  headers: { 'Authorization': 'Client-ID ' + process.env.IMGUR_CLIENT_ID }
});

app.get('/search/:query', function(req, res) {
  const url = 'gallery/search/top/0/?' + querystring.stringify({ q: req.params.query });
  instance.get(url)
    .then(function (result) {
      res.send(result.data.data.filter(item => !item.is_album && !item.nsfw && !item.animated));
    })
    .catch(function (error) {
      console.log(error);
    })
  ;
});

app.listen(port, function() {
  console.log("Node app is running on port " + port);
});