/*********** Deck Class ************
	The deck class sets an array to the array of objects in deck.js
	It has a getter for its deck

	shuffle() - shuffles the values of the array
		It generates a random number between i and the last index of the array
			set the max value (array length - 1) minus the min value (current iteration of for loop or i) and add the min value
		use math.floor to not go past the bounds of the array

		set a temp variable to the deck at the current index
		swap the current index value with the random index value, setting the random index value to temp

		reset the ace values to 11 at each shuffle

	firstDraw() - returns the first two values of the deck
		It doesn't actually pull out the cards so it gets shuffled after setting hand equal to their value

	draw() - works like first draw except it only affects the top card
*/

class Deck {
	constructor() {
		this._deck = standDeck.cards;
	}
	get deck	()	{return this._deck;}
	
	shuffle() {
		for (let i = 0; i < this._deck.length; i++) {
			let rand = Math.floor(Math.random() * (this._deck.length - i) + i);
			
			let temp = this._deck[i];
			this._deck[i] = this._deck[rand];
			this._deck[rand] = temp;

			if (this._deck[i].rank === "ace") {
				this._deck[i].value = 11;
			}
		}	
	}

	firstDraw() {

		var hand = this._deck.slice(0, 2);
		this.shuffle();
		return hand;
	}
	
	draw() {

		var card = this._deck.slice(0, 1);
		this.shuffle();
		return card;
	}
}
/********* Player Class **********
	The Player class needs to be passed a deck 
	It has all basic functionality for playing such as finding current total of cards in hand, drawing cards and displaying the hand.
	
	this._won is only used outside of this class.

	calcTotal() - counts aces and finds the total value of a player's hand.

	calcTotalHand() - checks if a player is about to go bust and if he has at least one ace, it calls calcAce and then calcTotal.

	calcAce() - if there is one ace, it loops through, finds it and lowers its value to one.
				If there is more than one, it loops through, finds the first one and lowers the value to one.
					Then it calls calcTotal to find the new total.
					If the player will still go bust, it looks for the next ace and lowers its value.
					
					This continues until the player can't go bust, or there are no more cards to loop through.

	firstDraw() - calls the deck's first draw and calcTotalHand().

	draw() - calls the deck's draw and then computes the total using calcTotalHand().

	displayHand() - goes through the player's hand and displays the image, the name and value of each and the total value underneath.
*/


class Player {
	constructor(deck) {
		//Arrays
		this._deck = deck;
		this._hand = [];
		this._hand.length = 0;

		//Int
		this._totalHand = 0;

		//Ace related ints
		this._aceCount = 0;
		this._aces = 0;

		//Boolean for winner/loser and variable to display hand
		this._won = false;
		this._showHand = document.getElementById("hand");
	}

	get totalHand	()		{return this._totalHand;}
	set won			(won)	{this._won = won;		}
	get won			()		{return this._won;		}

	calcTotal() {
		this._totalHand = 0;
		this._aceCount = 0;

		for (let i = 0; i < this._hand.length; i++) {
			this._totalHand += this._hand[i].value;
			if (this._hand[i].rank === "ace") {
				this._aceCount++;
			}
		}
		return this._totalHand;
	}

	calcTotalHand() {
		this.calcTotal();

		if (this._totalHand > 21 && this._aceCount !== 0) {
			this.calcAce();
			this.calcTotal();
		}
		return this._totalHand;
	}

	calcAce() {
		if (this._totalHand > 21 && this._aceCount === 1) {
			for (let i = 0; i < this._hand.length; i++) {
				if (this._hand[i].rank === "ace") {
					this._hand[i].value = 1;

					break;	//No more aces to check for, so no point in looping.
				}
			}
		}
		else if (this._aceCount > 1) {

			for (let i = 0; i < this._hand.length; i++) {
				if (this._hand[i].rank === "ace") {
					this._hand[i].value = 1;

				}
				let tempInt = this.calcTotal();
				if (tempInt > 21) {
					continue;
				} else {
					break;
				}
			}
		}
	}

	firstDraw() {
		this._hand = this._deck.firstDraw();
		this.calcTotalHand();

		//You can cheat by looking at the second set of values in the console - those are the dealer's first two cards
		console.log("1st " + this._hand[0].value);
		console.log("2nd " + this._hand[1].value);

		return this._hand;
	}

	draw() {
		let newCard = this._deck.draw();
		this._hand.push(newCard[0]);

		this.calcTotalHand();
	}
	
	displayHand() {
		let handCards = "You have: ";
		let imgDis = "";

		for (var len = 0; len < this._hand.length - 1; len++) {
			handCards += this._hand[len].name + "(" + this._hand[len].value + ") and ";
				
			imgDis += '<img src="' + this._hand[len].image + '" />';

		}
			
		handCards += this._hand[len].name + "(" + this._hand[len].value + ").";
		this._showHand.innerHTML = handCards;

		document.getElementById("totalP").innerHTML = "Total: " + this._totalHand;

		imgDis += '<img src="' + this._hand[len].image + '" />';
		document.getElementById("image").innerHTML = imgDis;

	}
}
/********** Dealer Class *********
	Similar to its parent, the Player class, it inherits and uses most of its functionality as is.

	draw() - is modified to have extra checks for values >= 17 and the ability to modify the dealer status (permission to draw)
		
	displayCard() - only shows the dealer's first card

	displayHand() - is modified to say "The dealer has" instaed of "You have"
*/
class Dealer extends Player {
	constructor(deck) {
		super(deck);
		this._showDHand = document.getElementById("dealerHand");
	}
	
	draw(dealerStatus) {
		if (this._totalHand < 17) {
			let newCard = this._deck.draw();
			this._hand.push(newCard[0]);
			
			this.calcTotalHand();
			if (this._totalHand >= 17) {
				dealerStatus = false;
			}
		} else {
			dealerStatus = false;
		}
		return dealerStatus;
	}
	
	displayCard() {
		let cardMes = "The dealer's first card is " + this._hand[0].name + "(" + this._hand[0].value + ").";
		this._showDHand.innerHTML = cardMes;

		let imgDis = '<img src="' +  this._hand[0].image + '" />';
		document.getElementById("imageD").innerHTML = imgDis;
	}

	displayHand() {
		let handCards = "The dealer has: ";
		let imgDis = "";

		for (var l = 0; l < this._hand.length - 1; l++) {
			handCards += this._hand[l].name + "(" + this._hand[l].value + ") and ";

			imgDis += '<img src="' + this._hand[l].image + '" />';
		}
			
		handCards += this._hand[l].name + "(" + this._hand[l].value + ").";
		this._showDHand.innerHTML = handCards;

		document.getElementById("totalD").innerHTML = "Total: " + this._totalHand;

		imgDis += '<img src="' + this._hand[l].image + '" />';
		document.getElementById("imageD").innerHTML = imgDis;
	}	
}
/********** GameManager Class *********
	Create an instance of each class to be used
	Shuffle the deck and pass the Deck instance to each of the players, set canDraw to true 

	startGame() - gives each player a turn and checks for winners

	userDraw() - the player draws, new hand is displayed, and there is a check for winners

	dealerDraw() - the dealer draws until he wins, his total reaches 17, or he goes bust

	checkWinners() - checks if anyone won

	displayVictory() - shows who won
*/

class GameManager {
	constructor() {
		this._deckInst = new Deck();
		this._deckInst.shuffle();
		this._dealer = new Dealer(this._deckInst);
		this._user = new Player(this._deckInst);
		this._canDraw = true;
	}
		
	startGame() {
		//Make the start game button unclickable until someone wins
		document.getElementById("start").disabled = true;
		
		//Have each player draw and run a check for winners
		this._user.firstDraw();
		this._user.displayHand();
		this._dealer.firstDraw();
		this.checkWinners();
	}

	userDraw() {
		this._user.draw();
		this._user.displayHand();
		this.checkWinners();	
	}

	dealerDraw() {
		while (this._canDraw) {
			this._canDraw = this._dealer.draw(this._canDraw);
			this.checkWinners();
		}
	}

	checkWinners() {
		if (this._user.totalHand === 21) {			//If the user has 21 the user won
			this._user.won = true;
		}
		if (this._dealer.totalHand === 21) {		//If the dealer has 21 the dealer won
			this._dealer.won = true;
		} else if (this._user.totalHand > 21) {		//If the user goes bust, the dealer won
			this._dealer.won = true;
		} else if (this._dealer.totalHand > 21) {	//If the dealer goes bust, the player won
			this._user.won = true;
		}

		if (this._canDraw == false && this._dealer.totalHand <= 21) {	//If the dealer can't draw, and is not bust
			if (this._dealer.totalHand > this._user.totalHand) {		//If his hand is greater than player's he won
				this._dealer.won = true;
					
			} else if (this._dealer.totalHand == this._user.totalHand) { //Check for a tie
				this._dealer.won = true;
				this._user.won = true;
					
			} else {							//If the dealer's hand is less than the player's, the player won
				this._user.won = true;
			}
		}

		if (this._user.won == true || this._dealer.won == true) {	//If there is a winner show it
			this.displayVictory();
		} else {										//else show the dealer's first card and give the player a turn
			this._dealer.displayCard();
			document.getElementById("hit").disabled = false;
			document.getElementById("stand").disabled = false;
		}
	}
	
	displayVictory() {
		var victoryMes = document.getElementById("victor");

		var mes = this._user.won ? 'Congrats you won!': 'Too bad. You Lost.';	//Show who won
		if (this._user.won && this._dealer.won) {						//Check for tie
			mes = "It's a tie.";
		}

		victoryMes.innerHTML = mes;
		this._dealer.displayHand();						//Show dealer's full hand

		document.getElementById("start").disabled = false;	//enable start game button

		//Disable hit and stand buttons
		document.getElementById("hit").disabled = true;
		document.getElementById("stand").disabled = true;
	}
}

//Initially disable the hit and stand buttons
document.getElementById("hit").disabled = true;
document.getElementById("stand").disabled = true;

//clear the screen
//create a global instance of the GameManager class and start the game
function start() {
	clear();
	c = new GameManager();
	c.startGame();	
}

//Clear last game's results and redisable buttons
function clear() {
	document.getElementById("hand").innerHTML = "";
	document.getElementById("totalP").innerHTML = "";
	document.getElementById("victor").innerHTML = "";
	document.getElementById("dealerHand").innerHTML = "";
	document.getElementById("totalD").innerHTML = "";


	document.getElementById("hit").disabled = true;
	document.getElementById("stand").disabled = true;

//	document.getElementById("image").innerHTML = "";
}

//gives the user a turn
function hit() {
	c.userDraw();
}

//gives the dealer turns until there is a winner
function stand() {
	c.dealerDraw();
}
