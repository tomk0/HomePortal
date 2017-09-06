var socket = io.connect();
var id = '';


    $(function(){

        socket.on('id', function(data){
            id = data;
            console.log("My Socket ID is: "+ id);

        });

    });