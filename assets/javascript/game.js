

var player1Connected = false;
var player2Connected = false;
var player = 0;
var turn = 0;
var player1Name = "";
var player2Name = "";
var rWins = "Scissors";
var pWins = "Rock";
var sWins = "Paper";


$(document).ready(function() {

    //Hide choices.
    $(".choices").hide();
    $(".chosen").hide();

    // Initialize Firebase.
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
            var player1Wins = snapshot.child("multi-rps/players/1").val().wins;
            var player1Losses = snapshot.child("multi-rps/players/1").val().losses;
            $("#box1row1").text(name);
            player1Name = name;
            $("#box1row3").text(`Wins: ${player1Wins} Losses: ${player1Losses}`);
        } else{
            player1Connected = false;
            $("#box1row1").text("Waiting for Player 1");         
        }

        if(snapshot.child("multi-rps/players/2").exists()){

            player2Connected = true;
            var name = snapshot.child("multi-rps/players/2").val().name;
            var player2Wins = snapshot.child("multi-rps/players/2").val().wins;
            var player2Losses = snapshot.child("multi-rps/players/2").val().losses;            
            $("#box3row1").text(name);
            player2Name = name;
            $("#box3row3").text(`Wins: ${player2Wins} Losses: ${player2Losses}`);
        } else{
            player2Connected = false;
            $("#box3row1").text("Waiting for Player 2");
        }

        if(snapshot.child("multi-rps/turn").exists()){

            var updatedTurn = parseInt(snapshot.child("multi-rps/turn").val());

            if(turn !== 3 && updatedTurn === 3){

                turn = 3;

                compareResults(snapshot);

                database.ref("multi-rps").update({
                    'turn': 1
                });

            } else if(turn !== 1 && updatedTurn === 1){

                turn = 1;

                $("#box3border").css({"border-color": "black"});
                $("#box1border").css({"border-color": "lightgreen"});

                if(player === 1){

                    $("#systemMessage2").html(`<h5>It's your turn!</h5>`);

                    $("#box1row2").children(".choices").show();
                    $("#box1row2").children(".chosen").hide();
                } else{
                    $("#systemMessage2").html(`<h5>Waiting for ${player1Name} to choose.</h5>`);
                }

            } else if(turn !== 2 && updatedTurn === 2){

                turn = 2;

                $("#box1border").css({"border-color": "black"});
                $("#box3border").css({"border-color": "lightgreen"});

                if(player === 2){

                    $("#systemMessage2").html(`<h5>It's your turn!</h5>`);

                    $("#box3row2").children(".choices").show();
                    $("#box3row2").children(".chosen").hide();
                } else{
                    $("#systemMessage2").html(`<h5>Waiting for ${player2Name} to choose.</h5>`);
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

    $(".choices").on("click", function(event){

        var val = $(this).attr("value");
        
        database.ref("multi-rps/players/" + player).update({
                'choice': val
        });

        var boxRow = "";
        if(player === 1){
            boxRow = "#box1row2";
        } else if(player === 2){
            boxRow = "#box3row2";
        }
        $(boxRow).children(".choices").hide();  
        var chosen = $(boxRow).children(".chosen");
        chosen.text(val);
        chosen.show();

        database.ref("multi-rps").update({
                'turn': turn+1
        });

    });

    function compareResults(snapshot){

        var choice1 = snapshot.child("multi-rps/players/1").val().choice;
        var choice2 = snapshot.child("multi-rps/players/2").val().choice;
        var wins1 = parseInt(snapshot.child("multi-rps/players/1").val().wins);
        var wins2 = parseInt(snapshot.child("multi-rps/players/2").val().wins);
        var losses1 = parseInt(snapshot.child("multi-rps/players/1").val().losses);
        var losses2 = parseInt(snapshot.child("multi-rps/players/2").val().losses);


        if(choice1 === choice2){
          // Tie game.
        } else if((choice1 === "Rock" && choice2 === rWins) ||
                  (choice1 === "Paper" && choice2 === pWins) ||
                  (choice1 === "Scissors" && choice2 === sWins)){

                    $("#result").html("<p>" + player1Name + " Wins!</p>");
                    wins1++;
                    losses2++;
        } else if((choice2 === "Rock" && choice1 === rWins) ||
                  (choice2 === "Paper" && choice1 === pWins) ||
                  (choice2 === "Scissors" && choice1 === sWins)){

                    $("#result").html("<p>" + player2Name + " Wins!</p>");
                    wins2++;
                    losses1++;
        }

        database.ref("multi-rps/players/1").update({
                    'wins': wins1,
                    'losses': losses1
        });
        database.ref("multi-rps/players/2").update({
                    'wins': wins2,
                    'losses': losses2
        });
    }    
});



