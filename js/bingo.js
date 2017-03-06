;var bingo = window.bingo || {};
bingo = (function() {

	// global vars
	var numbersTable,
		numbers,
		highlightedNoContainer,
		highlightedNo,
		highlightedNoPrefix,
		selectedNumbers = [],
		currentGame,
		logGame = false,
		players = [];

	// initialisation function
	var init = function() {

		// find numbers table and the highlighted number container
		numbersTable = document.getElementById('numbersTable');
		highlightedNoContainer = document.getElementById('highlightedNo');
		if (numbersTable == null || highlightedNoContainer == null) return false;

		// set the numbers array for updating the numbers table
		numbers = numbersTable.getElementsByTagName('td');
		if (numbers.length != 100) return false;

		// set the highlighted number (actual number only) container
		var highlightedNoChildren = highlightedNoContainer.getElementsByTagName('span');
		if (highlightedNoChildren.length == 2) {
			highlightedNo       = highlightedNoChildren[1];
			highlightedNoPrefix = highlightedNoChildren[0];
		} else {
			return false;
		}

		// start a game
		var gameInitiator = document.getElementById('startGame');
		if (gameInitiator != null) {
			gameInitiator.addEventListener('click', function(evt) {
				evt.preventDefault();

				if (logGame == true) console.log('game started');

				window.scrollTo(0, numbersTable.offsetTop - 100);

				var countdownContainer = document.getElementById('countdown');
				initiateCountdown(countdownContainer, 5);

				currentGame = setTimeout(pickNoForGame, 5000);

			}, false);
		}

		var initiateCountdown = function(div, duration) {

			// if delay && interval && completionFunction
			// if delay % interval = 0
			
			div.innerHTML = duration;

			var countdown = setTimeout(function(){decrementCountdown(div,duration)}, 1000);

		};

		var decrementCountdown = function(div, duration) {
			console.log(div,duration);
			duration--;
			div.innerHTML = duration;
			if (duration>1) {
				setTimeout(function(){decrementCountdown(div, duration)}, 1000);
			}
			if (duration==1) {
				setTimeout(function(){div.innerHTML = '';}, 1000);
			}
		}

		// pause a game
		var gamePauser = document.getElementById('pauseGame');
		if (gamePauser != null) {
			gamePauser.addEventListener('click', function(evt) {
				evt.preventDefault();

				pauseGame();
			}, false);
		}

		// reset a game
		var gameResetter = document.getElementById('resetGame');
		if (gameResetter != null) {
				gameResetter.addEventListener('click', function(evt) {
				evt.preventDefault();

				pauseGame();
				
				var confirmReset = confirm('Are you sure you want to reset the game?\n\nAll numbers will be lost.');
				if (confirmReset == true) {
					resetGame();
				}

			}, false);
		}

		// create a card for a player
		var setupPlayerCards = document.getElementById('setupPlayerCards');
		if (setupPlayerCards != null) {
			setupPlayerCards.addEventListener('click', function(evt) {
				evt.preventDefault();

				// check if game started?

				checkNoOfPlayers();
			}, false);
		}

		// regenerate a card for an existing player
		var regeneratePlayerCard = document.getElementById('regeneratePlayerCard');
		if (regeneratePlayerCard != null) {
			regeneratePlayerCard.addEventListener('click', function(evt) {
				evt.preventDefault();

				if (players.length > 0) {
					var playerNo = prompt('Please enter the player number.\n\nUse only 1 to 9 characters.\n\nThe player number can be found in the top right hand corner of the bingo card.'),
					playerNoRegex = /^[1-9]{1}$/;
			
					var validPlayerNo = playerNoRegex.test(playerNo);

					while (playerNo === null || validPlayerNo === false) {
						playerNo = prompt('You did not enter a number between 1 and 9. Please type a number using only 1-9 characters.\n\nPlease enter the player number.\n\nThe player number can be found in the top right hand corner of the bingo card.');
						validPlayerNo = playerNoRegex.test(playerNo);
					}

					generateCard(playerNo, true);
				} else {
					alert('A game has not yet been started.');
				}
				
			}, false);
		}

	};

	// generate random number
	var generateNo = function() {
		var no = Math.ceil(Math.random() * 100);
		return no;
	};

	// update the numbers table to show the given number as selected
	var updateNumbersTable = function(no, numbersArrayIndex) {
		numbers[numbersArrayIndex].setAttribute('class','selected');
		selectedNumbers.push(no);
	}

	// update the highlighted number section to display the number given
	var updateHighlightedNo = function(no) {
		highlightedNo.innerHTML = '' + no;
	}

	// pick a number for a game
	var pickNoForGame = function() {

		if (selectedNumbers.length == 100) {
			pauseGame();
			alert('There were no winners this time :(');
			if (logGame == true) console.log('game ended');
			return false; // stop generating numbers
		}

		// generate a numbers
		var randomNo = generateNo();

		// map the current 1-indexed 'no' argument to the 0-indexed numbers array
		var numbersArrayIndex = randomNo - 1;

		// if number already chosen, re-call function with new random number
		if (numbers[numbersArrayIndex].getAttribute('class') == 'selected') {
			
			if (logGame == true) console.log(randomNo,'need to pick a new number');

			// immediately pick next number
			pickNoForGame();

		// else record the number as selected
		} else {
			
			if (logGame == true) console.log(randomNo);

			// update the numbers table and the highlighted number
			// sections to display the random number generated
			updateNumbersTable(randomNo, numbersArrayIndex);
			updateHighlightedNo(randomNo);

			// set time delay for picking next number (continuous loop)
			currentGame = setTimeout(pickNoForGame, 6000);
		}

	}

	// pause a running game
	var pauseGame = function() {
		if (logGame == true) console.log('paused');
		alert('Game paused');
		clearTimeout(currentGame);
	}

	// reset a game
	var resetGame = function() {
		for (var i=0, il=numbers.length; i<il; i++) {
			numbers[i].removeAttribute('class');
		}
		updateHighlightedNo('##');
		selectedNumbers = [];
		if (logGame == true) console.log('game reset');
	}

	// check how many people want to play, to generate that many cards
	var checkNoOfPlayers = function() {
		var noOfPlayers = prompt('How many people want to play?\n\n(Please type a number, between 2 and 9)'),
			noOfPlayersRegex = /^[2-9]{1}$/;
			
		var validPlayers = noOfPlayersRegex.test(noOfPlayers);

		while (noOfPlayers === null || validPlayers === false) {
			noOfPlayers = prompt('You did not enter a number between 2 and 9. Please type a number using only 2-9 characters.\n\nHow many people want to play?');
			validPlayers = noOfPlayersRegex.test(noOfPlayers);
		}

		for (var i=1; i<=noOfPlayers; i++) {
			setupPlayer(i);
		}

		window.scrollTo(0, document.getElementById('playerCards').offsetTop - 100);
	}

	// set up a new player
	var setupPlayer = function(playerNo) {
		generateCard(playerNo, false);

		// record card details
	}

	// generate a player card
	var generateCard = function(playerNo, existingPlayer) {

		var cardNumbers = {
			'00s': [],
			'10s': [],
			'20s': [],
			'30s': [],
			'40s': [],
			'50s': [],
			'60s': [],
			'70s': [],
			'80s': [],
			'90s': [],
			noOfNumbers: 0,
			cardNumbersArray: []
		};

		// for a new player, generate new card numbers
		if (existingPlayer == false) {
			console.log('new player');

			// generate new card numbers
			while (cardNumbers.noOfNumbers < 15) {
				pickNoForCard(cardNumbers);
			}

			// save to players array
			//players.push(cardNumbers);

		// for existing player, get card numbers from players array
		} else {
			console.log('existingPlayer');

			// cardNumbers = players[1];
		}

		console.log(cardNumbers.cardNumbersArray);

		var card = document.getElementById('playerCards');
		card.innerHTML += [
			'<div class="playerCard card' + playerNo + '">',
				'<p>Player Number: ' + playerNo + '</p>',
				'<table>',
					'<thead class="visuallyHidden">',
						'<tr>',
							'<th>Noughts</th>',
							'<th>Tens</th>',
							'<th>Twenties</th>',
							'<th>Thirties</th>',
							'<th>Fourties</th>',
							'<th>Fifties</th>',
							'<th>Sixties</th>',
							'<th>Seventies</th>',
							'<th>Eighties</th>',
							'<th>Nineties</th>',
						'</tr>',
					'</thead>',
					'<tbody>',
						'<tr>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
						'</tr>',
						'<tr>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
						'</tr>',
						'<tr>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
							'<td></td>',
						'</tr>',
					'</tbody>',
				'</table>',
			'</div>'
		].join('');

		var tbody = card.getElementsByTagName('tbody')[playerNo - 1];
		var rows = tbody.getElementsByTagName('tr');

		/*for (var i=0; i<10; i++) {
			var property = i + '0s';
			for (var j=0, jl=cardNumbers[property].length; j<jl; j++) {
				rows[j].getElementsByTagName('td')[i].innerHTML = cardNumbers[property][j];
			}
		}*/
		/*for (var yPos=0; yPos<3; yPos++) {
			for (var i=0; i<5; i++) {
				var xPos = Math.ceil(Math.random() * 10);
				var tensUnitArray = xPos + '0s';

			}
			
			if (rows[0].getElementsByTagName('td')[xPos].innerHTML == cardNumbers[tensUnitArray][0]) {

			} else {
				rows[0].getElementsByTagName('td')[xPos].innerHTML = cardNumbers[tensUnitArray][0];
			}
		}*/
		var il = cardNumbers.cardNumbersArray.length,
		yPos = 0;
		for (var i=0; i<il; i++) {
			var noToInsert = cardNumbers.cardNumbersArray[i];
			var xPos;
			if (noToInsert.length == 3) {
				xPos = 9;
			} else {
				xPos = noToInsert.charAt('0');
			}
			rows[yPos].getElementsByTagName('td')[xPos].innerHTML = noToInsert;
			if (i == 4 || i == 9) yPos++;
		}
	}

	var pickNoForCard = function(cardNumbers) {
		var randomNo = generateNo(),
			number,
			tensUnit;

		number = '' + randomNo;

		if (randomNo == 100) {
			tensUnit = '9';
		} else if (randomNo < 10) {
			number = '0' + randomNo;
			tensUnit = '0';
		} else {
			number = '' + randomNo;
			tensUnit = number.charAt('0');
		}
		
		checkPlayerNumbers(cardNumbers, tensUnit + '0s', number);
	}

	var checkPlayerNumbers = function(cardNumbersObj, property, number) {
		var numbersToCheck = cardNumbersObj[property];
		var noOfNumbersToCheck = numbersToCheck.length;
		switch (noOfNumbersToCheck) {
			case 0:
				numbersToCheck.push(number);
				cardNumbersObj.cardNumbersArray.push(number);
				cardNumbersObj.noOfNumbers++;
				break;
			case 1:
				var isTensUnitsCompleted = checkTensPopulated(cardNumbersObj);
				if (isTensUnitsCompleted == false) {
					// pick again to make sure all tens units have at least one value
					pickNoForCard(cardNumbersObj);
				} else {
					for (var i=0;i<noOfNumbersToCheck;i++) {
						if (numbersToCheck[i] == number) {
							//start again with new number; already used
							pickNoForCard(cardNumbersObj);
						} else if (i == (noOfNumbersToCheck - 1)) {
							numbersToCheck.push(number);
							cardNumbersObj.cardNumbersArray.push(number);
							cardNumbersObj.noOfNumbers++;
						}
					}
				}
				break;
			case 2:
				// start again with new number; tens unit full
				pickNoForCard(cardNumbersObj);
				break;
		}
	}

	var checkTensPopulated = function(cardNumbersObj) {
		var isPopulated;
		for (prop in cardNumbersObj) {
			var arrayLength = cardNumbersObj[prop].length;
			if (arrayLength != undefined) {
				if (arrayLength == 0) {
					isPopulated = false;
					break;
				}
			}
		}
		return isPopulated;
	}

	// reveal public methods
	return {
		init: init
	}

})();

// run initialisation
bingo.init();