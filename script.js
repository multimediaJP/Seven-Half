document.body.onload = inici;

//TODO cambiar baralla a la española, pq A = 1 i sembla q sigui de 1/2

function inici(){

    //nomes ensenyar la part de entrar informacio de jugador
    document.getElementById("GamePage").style.display = "none";
    //Assignar funcions de botons
    document.getElementById("StartGame").onclick = startGame;
    document.getElementById("newRound").onclick = newRound;
    document.getElementById("endGame").onclick = endGame;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//variables globals
var moneyBet = 0;
var playerName = "";
var playerMoney = 0;

let usedCards = [];
let playerSum = 0;
let dealerSum = 0;

function startGame(event){
    event.preventDefault();

    playerName = document.getElementById("playerName").value;
    playerMoney = parseInt(document.getElementById("initialMoney").value);
    if(playerName === "" || playerMoney <= 0 || isNaN(playerMoney)){
        alert("Please enter a valid name and money amount.");
        return;
    }

    // hide previous page and display the game page
    document.getElementById("PlayerInformationPage").style.display = "none";
    document.getElementById("GamePage").style.display = "flex";
    

    document.getElementById("moneyInfo").innerText = playerMoney+ " €";
    document.getElementById("betInfo").innerText = moneyBet + " €"; //reset to 0
    document.getElementById("GamePlayerName").innerText = playerName;

}

function lock_buttons(){
    document.getElementById("newRound").disabled = true;
    document.getElementById("endGame").disabled = true;
}
function unlock_buttons(){
    document.getElementById("newRound").disabled = false;
    document.getElementById("endGame").disabled = false;
}

async function continueGame(){
    //block buttons
    lock_buttons();
    
    // ask for money bet
    do{
        let userInput = prompt("Enter your money bet:");
        moneyBet = parseInt(userInput);
        if(isNaN(moneyBet) || moneyBet > playerMoney){
            alert("Please enter a valid number");
        }
    }while(isNaN(moneyBet) || moneyBet > playerMoney);

    document.getElementById("betInfo").innerText = moneyBet + " €";

    //Start the game
    await sleep(1000);
    let exceeds7half = false;
    do{give_card("player"); // repartir cartes fins que vulgui
        if(playerSum > 7.5){
            exceeds7half = true;
            break;
        }
        await sleep(1000);
    }while(window.confirm("Do you want another card?"));

    await sleep(1000);
    if(exceeds7half){ // sha passat, acabar ja
        declareWinner("dealer");
    }
    else{ // fer que jugui el dealer, despres comprovar qui guanya
        playDealer();
    }

}

class Card {
    constructor(value, suit){
        this.value = value; // 1-7, JQK
        this.suit = suit;
    }
    
    addingValue(){
        if (this.value === "Q" || this.value === "J" || this.value==="K" ) {
            return 0.5;
        } else {
            return parseInt(this.value);
        }
    }
    displayCard(dest){
        const imgURL = `cardImages/${this.value}_of_${this.suit}.png`;

        const rotateX = Math.random() * 40 - 20; 
        const rotateY = Math.random() * 40 - 20; // transformacions aleatories
        const rotateZ = Math.random() * 30 - 15;
        const translateX = Math.random() * 20 - 10;
        const translateY = Math.random() * 0;
        const perspective = "500px";

        // crear imatge
        const cardElement = document.createElement('img');
        cardElement.src = imgURL;
        cardElement.alt = `${this.value} of ${this.suit}`;
        cardElement.classList.add('cardimg');

        cardElement.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translateX(${translateX}px) translateY(${translateY}px)`;
        cardElement.style.perspective = perspective;
        const div = document.getElementById(dest);
        div.appendChild(cardElement);        
        
        
    }

}


function give_card(dest){
// dest = player or dealer
    //create unique random card
    let newCard = generateRandomCard(); 
    while(usedCards.includes(`${newCard.value}_of_${newCard.suit}`)){
        console.log("was repeated");
        newCard = generateRandomCard();
    }
    usedCards.push(`${newCard.value}_of_${newCard.suit}`);

    if(dest == "player"){
        newCard.displayCard("PlayerCards");
        playerSum += newCard.addingValue();
    }else{
        // give dealer card
        newCard.displayCard("DealerCards");
        dealerSum += newCard.addingValue();
    }
}


function generateRandomCard(){
    let suits=["spades","clubs","diamonds","hearts"];
    let suit = suits[Math.floor(Math.random()*4)]; // suits[0-3]

    let num = Math.floor(Math.random()*10) + 1; //+1 pq floor arrodoneix a la baixa
    let letters = ["J","Q","K"];

    console.log("generated "+suit+ " - "+num);
    if(num > 7){ // 8 9 i 10 -> J Q K
        return new Card(letters[num-8],suit); //si dona num. 8, 8-8=0 -> posicio 0 de letters="J"
    }
    else{
        return new Card(num,suit);
    }
}

async function playDealer(){
    do{
        give_card("dealer");

        let distanceFromSevenHalf = 7.5 - dealerSum;
        let probabilityPlay = Math.min(1, distanceFromSevenHalf / 7.5); // /7.5 per normalitzar
        // exemple: dealersum: 1.   7.5-1 = 6.5.  6.5/7.5 = 0.86666 = probabilitat alta de seguir jugant
        //          dealersum: 6    7.5-6 = 1.5   1.5/7.5 = 0.2     = probabilitat baixa de seguir jugant
        // al principi: alta, com mes avança, mes baixa
        //console.log("p play: "+probabilityPlay+", sum:" + dealerSum);
        if(Math.random() > probabilityPlay){
            // al principi, probPlay es alt, es dificil q random > pplay -> jugara casi sempre
            // com mes aprop de 7.5, probPlay es baix, es facil q random > pplay -> no jugara sempre
            break;
        }
        await sleep(1000);
    }while(dealerSum < 7.5);
    await sleep(1000);
    if(dealerSum > 7.5){ 
        // si arribem aqui, playersum < 7.5, aixi q perd dealer si o si
        declareWinner("player");
    }
    else{ 
        // si arribem aqui, playersum i dealersum <= 7.5. El que s'acosti mes guanya = el sum més gran
        if(playerSum > dealerSum){
            declareWinner("player");
        } 
        else if(dealerSum > playerSum){
            declareWinner("dealer");
        } 
        else declareWinner("tie");
    }
}

function declareWinner(winner){
    console.log("playsum: "+playerSum+" - dealersum "+dealerSum+"winner: "+winner);
    let broke = false;
    if(winner === "player"){
        playerMoney += moneyBet;
        alert("You have won "+moneyBet+" €!! You now have: "+playerMoney+" €.")

    } else if(winner === "dealer"){
        playerMoney -= moneyBet;
        if(playerMoney === 0){
            broke = true;
            alert("You have lost all your money. Goodbye.");
        }
        else alert("You have lost "+moneyBet+" €. Remaining money: "+playerMoney+" €.");
    }
    else{ // tie
        alert("Tie!! You keep your bet money. Remaining money: "+playerMoney+ " €.");
    }
    
    // borrar valors per partida seguent
    playerSum = dealerSum = moneyBet = 0;
    usedCards.length = 0; 

    
    unlock_buttons();

    if(broke){
        endGame(false);
    }
    else{
        document.getElementById("moneyInfo").innerHTML = playerMoney+ " €";
    }
}

function newRound(){
    removeCards();
    continueGame();
}

function removeCards(){
    let cards = document.querySelectorAll("#Cards img");
    cards.forEach(function(card) {card.remove()} );
}

function endGame(msgYN = true){
    removeCards();

    if(msgYN)
        alert("You receive "+playerMoney+" €. See you next time!")
    // hide game page and display the landing page
    document.getElementById("PlayerInformationPage").style.display = "flex";
    document.getElementById("GamePage").style.display = "none";
}