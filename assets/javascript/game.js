

var player1Connected = false;
var player2Connected = false;
var player = 0;
var turn = 0;
var player1Name = "";
var player2Name = "";

$(document).ready(function() {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCGedS-eXOY3alApgtMk_cWyFlaxtsEuwA",
        authDomain: "rockpaper-611cc.firebaseapp.com",
        databaseURL: "https://rockpaper-611cc.firebaseio.com",
        projectId: "rockpaper-611cc",
        storageBucket: "",
        messagingSenderId: "284046562557"
    };

    firebase.initializeApp(config);

    var database = firebase.database();

    database.ref().once("value", function(snapshot) {

        if(snapshot.child("multi-rps/players/1").exists() &&
           snapshot.child("multi-rps/players/2").exists()){

            database.ref("multi-rps").remove().then(function() {
                console.log("Remove succeeded.")
            })
            .catch(function(error) {
                console.log("Remove failed: " + error.message)
            });
        }
        
    }, function(errorObject) {

        console.log("Errors handled: " + errorObject.code);
    });

    database.ref().on("value", function(snapshot) {

        console.log(snapshot.val());

        if(snapshot.child("multi-rps/players/1").exists()){

            player1Connected = true;
            var name = snapshot.child("multi-rps/players/1").val().name;
            $("#box1row1").text(name);
            player1Name = name;            
        } else{
            player1Connected = false;
            $("#box1row1").text("Waiting for Player 1");         
        }

        if(snapshot.child("multi-rps/players/2").exists()){

            player2Connected = true;
            var name = snapshot.child("multi-rps/players/2").val().name;
            $("#box3row1").text(name);
            player2Name = name;
        } else{
            player2Connected = false;
            $("#box3row1").text("Waiting for Player 2");
        }

        if(snapshot.child("multi-rps/turn").exists()){

            if(turn !== 1 && parseInt(snapshot.child("multi-rps/turn").val()) === 1){

                turn = 1;

                if(player === 1){
                    $("#systemMessage2").html(`<h5>It's your turn!</h5>`);
                } else{
                    $("#systemMessage2").html(`<h5>Waiting for ${player1Name} to choose</h5>`);
                }

            } else if(turn !== 2 && parseInt(snapshot.child("multi-rps/turn").val()) === 2){

                turn = 2;

                if(player === 2){
                    $("#systemMessage2").html(`<h5>It's your turn!</h5>`);

                } else{
                    $("#systemMessage2").html(`<h5>Waiting for ${player2Name} to choose</h5>`);
                } 
            }
        }
   
    }, function(errorObject) {

        console.log("Errors handled: " + errorObject.code);
    });


    $("#startButton").on("click", function(event){

	    event.preventDefault();

        var userName = $("#userName").val().trim();

        $("#userName").val("");
        $("#userName").hide();
        $("#startButton").hide();
        
        if( !player1Connected ){

            player1Connected = true;
            player = 1;
            database.ref("multi-rps/players/1").update({
                    'losses': 0,
                    'name': userName,
                    'wins': 0
            });

            $("#systemMessage1").html(`<h5>Hi ${userName}! You are Player 1</h5>`);

        } else if( !player2Connected ) {

            player2Connected = true;
            player = 2;
            database.ref("multi-rps/players/2").update({
                    'losses': 0,
                    'name': userName,
                    'wins': 0
            });
            database.ref("multi-rps").update({
                    'turn': 1
            });

            $("#systemMessage1").html(`<h5>Hi ${userName}! You are Player 2</h5>`);
        }
        

    });
});