  var http = require("http");
  var express = require("express");
  var path = require("path");
  var app = express();
  var port=8080;
  var res;

  app.set("views", path.resolve(__dirname, "..", "views"));
  app.set("view engine", "ejs");
  
  
  const axios = require('axios')
const jwt = require('jsonwebtoken');

const credentials = { "username": "Jim" };

const authServerUrl = "http://161.97.114.50:4000";
const serviceUrl =    "http://161.97.114.50:3000";

function isExpiredTokenSync(token) {
    let payload = "";
    try {
      tk = jwt.decode(token, { complete: true });
    } catch (e) {
      throw (e);
    }
  
    if (Date.now() >=  tk.payload.exp * 1000) {
      return true;
    } else {
      return false;
    }
  }
  
  async function getToken(cred, url) {
    console.log("Getting a new auth token");
    const data = cred;
    try {
        var res = await axios.post(url, data);
        //console.log(res);
        return res.data
    } catch (err) {
        //console.log(err);
        throw err;
        //return { error: true, msg: "auth failed" };
    }
}

async function makeHttpRequest() {

    try {

        if (typeof credTokens === 'undefined') {
            console.log("access token not available, creating 1st access token");
            // mi autentico e chiedo un nuovo token all'auth server
            credTokens = await getToken(credentials, authServerUrl + '/login');
        };

        
        if ( isExpiredTokenSync(credTokens.accessToken) ) {
            console.log("access token expired, creating a new one");
            credTokens.accessToken = await refreshToken(authServerUrl + '/renew_access_token', credTokens.refreshToken);
        };


        const headers = {
            headers: { 'Authorization': `Bearer ${credTokens.accessToken}` }
        };

        console.log("Accessing Service", serviceUrl + '/posts');
        res = await axios.get(serviceUrl + '/posts', headers);
        console.log(res.data);
    } catch (err) {
        console.log(err);
    }
}

app.get("/", function(request, response) {
	let posts = res.data;
	//let username = JSON.stringify(credentials)
    response.render("posts", { posts, credentials});
  });

var httpsvr=http.createServer(app); // Returns: <http.Server> 	
  httpsvr.listen(port, function() { console.log("Express app started on port", port); } );
  
  makeHttpRequest()
  .then( makeHttpRequest  )
  .then( makeHttpRequest  )
  .then( ()=>{console.log("attendo che scada il token")});
 


setTimeout(function(){  makeHttpRequest(); }, 10000);
setTimeout(function(){  makeHttpRequest(); }, 15000);
