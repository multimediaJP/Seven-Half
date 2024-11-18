document.body.onload = inici;

function inici(){

    //nomes ensenyar la part de entrar informacio de jugador
    document.getElementById("GamePage").style.display = "none";
    document.getElementById("StartGame").onclick = startGame;

}

function startGame(event){
    event.preventDefault()
    
    
    document.getElementById("PlayerInformationPage").style.display = "none";
    document.getElementById("GamePage").style.display = "flex";
    
    /* set up the game */
    const playerName = document.getElementById("playerName").value;
    playerMoney = document.getElementById("initialMoney").value;

    totalMoney = document.getElementById("totalMoney").innerText;
    document.getElementById("totalMoney").innerText = playerMoney+ " €";
    document.getElementById("GamePlayerName").innerText = playerName;

    /* Ask for money bet*/


    // ....

    /*Start the game*/
    give_card("player");
    
    // loop : ask if new card or not , while yes give cards
}

function give_card(dest){
// dest = player or dealer
    if(dest == "player"){

    }

}