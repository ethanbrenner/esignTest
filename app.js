var express = require('express');
var path = require('path');
var debug = require('debug');
var chalk = require('chalk');
var morgan = require('morgan')
var fs = require('fs');
var fileIO = require("fileIO.js");

var bodyParser = require('body-parser');

var port = 4242;
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

//printing info
app.use(morgan('tiny'));

//folder paths
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/images'));



app.get('/', function(req,res){
    res.sendFile(__dirname +'/public/index.html');
});
app.get('/clientForm', function (req,res){
    res.sendFile(__dirname + '/views/clientServiceAgreement.html');
});
app.get('/clientForm_Signature', function(req,res){
    //this route is for the inital signing from the client, no spouse
    res.render('clientServiceAgreement',{sigObject: fileIO.read(req).body.sigHolder, spouseSigObject: "temporary",spouseCode: req.body.code});
});
//was a get
app.post('/telephoneForm', function(req,res){
    //need to adjust this to use code for either client or spouse
    console.log("get received");
    if(req.body.code == '1')
    {
        res.render('telephoneContactConsent', {sigObject: fileIO.read(req,"clientSignature.txt").body.sigHolder, spouseSigObject:"temporary", spouseCode: req.body.code});
    }
    else
    {
        res.render('telephoneContactConsent', {sigObject: fileIO.read(req,"clientSignature.txt").body.sigHolder, spouseSigObject: fileIO.read(req,"spouseSignature.txt").body.sigHolder,spouseCode: req.body.code});
    }
    
});
app.get('/endForm', function(req,res){
    console.log("get received");
    res.sendFile(__dirname + '/views/endSplash.html');
});

//post requests
app.post('/signatureForm', function(req,res){
    //this route is for the inital signing from the client, before any signature has been taken
    res.render('sigCollectionPage', {code:req.body.spouseCode, clientSigHolder: "temporary" });
});
app.post('/spouseSigCollection', function(req,res){
    console.log("post received");
    res.render('sigCollectionPage', {code:req.body.spouseCode, clientSigHolder: req.body.sigHolder, spouseSigObject: "temporary"})
});

//get and post requests for read/write
app.post('/clientForm_Signature', function(req,res) {
    console.log("post received");
    //handles which file to write to
    if(req.body.code == '1'){
        fileIO.write(req.body.inputField,"clientSignature.txt");
        res.render('clientServiceAgreement', {sigObject:req.body.inputField, spouseSigObject:"temporary", code: req.body.code});
    }
    else {
        fileIO.write(req.body.inputField,"spouseSignature.txt");
        res.render('clientServiceAgreement', {sigObject:req.body.clientSigHolder, spouseSigObject: req.body.inputField, code: req.body.code})
    }
    //if client, then res.render(sigObject)
    //else res.render(spouseSigObject)
    //this idea here^^
    
});

app.get('/receiveFile', function(req,res){
   //should grab the code from the req obj
   //if client then res.render with sigHolder
   //ifspouse then res.render with spouseSigHolder and sigHolder
   //this idea ^^
    console.log("get received");
    if (req.body.code == '1'){
        res.render('telephoneContactConsent', {sigObject: fileIO.read(req,"clientSignature.txt").body.sigHolder, spouseSigObject:"1"});
    }
    else{
        res.render('telephoneContactConsent', {sigObject: fileIO.read(req,"clientSignature.txt").body.sigHolder, spouseSigObject:fileIO.read(req,"spouseSignature.txt").body.spouseSigHolder});
    }
    
   
});

app.listen(port, function(){
    console.log(chalk.green("The server is running on port "+port));
});