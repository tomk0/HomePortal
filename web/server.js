//Required library’s 
var express = require("express");
var app = express();
var router = express.Router();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mysql = require('mysql');

//Database Connection
var db = mysql.createConnection({

  host: '127.0.0.1',
  user: 'root',
  password: 'Salzgitter_1',
  database: ''

});

//Test connection
db.connect(function(err){

  if (err) console.log(err);

});


//sending the static files
app.use("/",router);
app.use('/static/js', express.static('site/js'));
app.use('/static/Mat', express.static('site/Mat'));
app.use('/static/css', express.static('site/css'));


// express router logic
router.use(function (req,res,next) {
  next();
});

router.get("/",function(req,res){
  res.sendFile(__dirname + "/site/html/index.html");
});

app.use("*",function(req,res){
  res.sendFile(__dirname + "/site/html/404.html");
});

//starting the webserver to listen on port 80
server.listen(8080);

//wating for connection
io.on('connect', function (socket) {
  // logging the connection and printing the ID
  console.log("Client Connected %s", socket.id);
  socket.emit('id', socket.id);

  // disconnection function
  socket.on('disconnect', function (data) {
    console.log('Client Disconected %s', socket.id);
    
  });

});

function getCount(coloum){

  var tmpResults = 0;

  db.query('SELECT COUNT(*) AS "COUNT"FROM ORDERS AS ORD WHERE '+coloum+' = FALSE;')
              .on('result', function(data){

                tmpResults = data.COUNT;
                console.log('2: '+tmpResults);
              })
              .on('end', function(){

                return tmpResults;
              });

}

function getTables(socketID){

  var tmp = [];

  db.query('SELECT TBL_ID AS "TBL_ID", TBL_NAME AS "TBL_NAME" FROM TABLES;')
    .on('result', function(data){
      tmp.push(data);
    })
    .on('end', function(){
      io.to(socketID).emit('InitTables', tmp);
    });

}

function dbComplete(ordID, Type){

  if(Type == 'Food'){
    Type = 'KITCHEN';
  }else if (Type == 'Drinks'){
    Type = 'FOH';
  }

  var sql = 'UPDATE ORDERS SET ORD_'+Type+'_COMP = TRUE WHERE ORD_ID = \''+ordID+'\';';

  db.query(sql)
  .on('result', function(data){

    console.log(data);

  }).on('end', function(){

    console.log('Updated '+ordID+' '+Type);

  })

}
