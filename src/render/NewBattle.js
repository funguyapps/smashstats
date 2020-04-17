const moment = require("moment");
const path = require("path");
const sqlite = require("sqlite3");

// doc references
const userFighter = document.getElementById("userFighter");
const userStocks = document.getElementById("userStocks");
const userImg = document.getElementById("userImg");

const opponentType = document.getElementById("opponentType");
const opponentQualifier = document.getElementById("opponentQualifier");
const opponentQualifierTitle = document.getElementById("opponentQualifierTitle");
const opponentFighter = document.getElementById("opponentFighter");
const opponentStocks = document.getElementById("opponentStocks");
const opponentImg = document.getElementById("opponentImg");

const saveButton = document.getElementById("saveButton");

const alertDiv = document.getElementById("alertDiv");

// event listeners
userFighter.onchange = () => { updatePicture(userFighter.value, userImg); resetStyle(userFighter); removeAlert(); };
userStocks.onchange = () => { resetStyle(userStocks); removeAlert(); };

opponentType.onchange = () => { updateQualifier(); }
opponentQualifier.onchange = () => { resetStyle(opponentQualifier); removeAlert(); };
opponentFighter.onchange = () => { updatePicture(opponentFighter.value, opponentImg); resetStyle(opponentFighter); removeAlert(); };
opponentStocks.onchange = () => { resetStyle(opponentStocks); removeAlert(); }

saveButton.onclick = () => { validate(saveButton); };

userStocks.onkeypress = (e) => { disableStr(e, userStocks, false); };
opponentStocks.onkeypress = (e) => { disableStr(e, opponentStocks, false); };

// necessary vars
const acceptedFighters = [
    "Banjo & Kazooie",
    "Bayonetta",
    "Bowser Jr.",
    "Bowser",
    "Byleth",
    "Captain Falcon",
    "Chrom",
    "Cloud",
    "Corrin",
    "Daisy",
    "Dark Pit",
    "Dark Samus",
    "Diddy Kong",
    "Donkey Kong",
    "Dr. Mario",
    "Duck Hunt",
    "Falco",
    "Fox",
    "Ganondorf",
    "Greninja",
    "Hero",
    "Ice Climbers",
    "Ike",
    "Incineroar",
    "Inkling",
    "Isabelle",
    "Jigglypuff",
    "Joker",
    "Ken",
    "King Dedede",
    "King K. Rool",
    "Kirby",
    "Link",
    "Little Mac",
    "Lucario",
    "Lucas",
    "Lucina",
    "Luigi",
    "Mario",
    "Marth",
    "Mega Man",
    "Meta Knight",
    "Mewtwo",
    "Mii Brawler",
    "Mii Gunner",
    "Mii Swordfighter",
    "Mr. Game & Watch",
    "Ness",
    "Olimar",
    "Pac-Man",
    "Palutena",
    "Peach",
    "Pichu",
    "Pikachu",
    "Piranha Plant",
    "Pit",
    "Pokemon Trainer",
    "R.O.B.",
    "Richter",
    "Ridley",
    "Robin",
    "Rosalina & Luma",
    "Roy",
    "Ryu",
    "Samus",
    "Sheik",
    "Shulk",
    "Simon",
    "Snake",
    "Sonic",
    "Terry",
    "Toon Link",
    "Villager",
    "Wario",
    "Wii Fit Trainer",
    "Wolf",
    "Yoshi",
    "Young Link",
    "Zelda",
    "Zero Suit Samus"
]

// set up autocomplete
autocomplete(userFighter, acceptedFighters, userImg);
autocomplete(opponentFighter, acceptedFighters, opponentImg);

// EVENT FUNCTIONS
function updatePicture(fighter, img)
{
    fighter = titleCase(fighter);

    if (acceptedFighters.includes(fighter))
    {
        img.src = path.join(__dirname, "../assets/fighters_adjusted", fighter + ".png");
    }
}

function updateQualifier()
{
	if (opponentType.value === "Human")
	{
		opponentQualifierTitle.textContent = "Name";
		opponentQualifier.onkeypress = () => {};
		opponentQualifier.style = "width: 11vw;";
	}
	else
	{
		opponentQualifierTitle.textContent = "Level";
		opponentQualifier.onkeypress = (e) => { disableStr(e, opponentQualifier, true); };
		opponentQualifier.style = "width: 5vw;"
	}
}

function validate(sender)
{
  	if (checkNotEmpty() && checkWinner() && checkFighters())
  	{
		dataOperations();
		
		//sender.href = "./Home.html";
	}

	function checkNotEmpty()
	{
		let valid = true;

		const inputs = [userFighter, userStocks, opponentQualifier, opponentStocks, opponentFighter];

		inputs.map((i) => 
		{  
			if (i.value === "")
			{
				valid = false;

				i.style = "border: 1px solid var(--red);";
			}
		});

		return valid;
	}

	function checkWinner()
	{
		let winner = true;

		if (userStocks.value === "0" && opponentStocks.value === "0")
		{
			winner = false;
			createAlert("Both the user and opponent have 0 stocks remaining. Please check these values and try again.", true);
		}
		else if (userStocks.value !== "0" && opponentStocks.value !== "0")
		{
			winner = false;
			createAlert("Neither player has lost. Please check the stock values to make sure one player is at 0 and try again.", true);
		}
		else if (parseInt(userStocks.value) > 3 || parseInt(opponentStocks.value) > 3)
		{
			winner = false;
			createAlert("One stock value is above 3. Please check these values and try again.", true);
		}
		
		return winner;
	}

	function checkFighters()
	{
		let valid = true;

		if (!(acceptedFighters.includes(titleCase(userFighter.value))))
		{
			valid = false;
			createAlert("Invalid user fighter name. Check that value and try again.", false);
		}
		
		if (!(acceptedFighters.includes(titleCase(opponentFighter.value))))
		{
			valid = false;
			createAlert("Invalid opponent fighter name. Check that value and try again.", false);
		}

		return valid;
	}
}

function disableStr(e, input, allNums)
{
	let min = 48;
	let max = 51;
	
	if (allNums) { min = 49; max = 57; }

	if (e.keyCode === 8) // backspace
	{
		// pass
	}
	else if (e.keyCode >= min && e.keyCode <= max) // numbers
	{
		if (input.value.length >= 1) // no num input should be greater than 1 digit
		{
			block();
		}
	}
	else // any other key
	{
		block();
	}

	function block()
	{
		e.preventDefault();
		return false;
	}
}

function resetStyle(input)
{
	input.style = "";
}

function removeAlert()
{
	while (alertDiv.lastChild)
	{
		alertDiv.removeChild(alertDiv.lastChild);
	}

	userStocks.style = "";
	opponentStocks.style = "";
}

// HELPER FUNCTIONS
function dataOperations()
{
	const db = new sqlite.Database(path.join(__dirname, "../stats.db"));

	// function vars
	let totalWins, totalCount, charWins, charCount;
	let newTotalPct, newCharPct;
	let won = false;

	// check if won
	if (userStocks.value !== "0") { won = true; }

	// sql
	const getTotalWins = "SELECT * FROM Battles WHERE User_Stocks != 0";
	const getTotalCount = "SELECT * FROM Battles";
	const getCharWins = "SELECT * FROM Battles WHERE User_Fighter=\"" + titleCase(userFighter.value) + "\" AND User_Stocks != 0";
	const getCharCount = "SELECT * FROM Battles WHERE User_Fighter=\"" + titleCase(userFighter.value) + "\"";

	// Battles Table Operations
	// get total wins
	db.all(getTotalWins, (err, rows) => 
	{
		totalWins = rows.length;

		// THEN get total count
		db.all(getTotalCount, (err, rows) => 
		{
			totalCount = rows.length;

			// THEN get char wins
			db.all(getCharWins, (err, rows) => 
			{
				charWins = rows.length;

				// THEN get char total
				db.all(getCharCount, (err, rows) => 
				{
					charCount = rows.length;

					// THEN calculate new pcts & variables
					newTotalPct = getNewWinPct(totalWins, totalCount);
					newCharPct = getNewWinPct(charWins, charCount);

					let opponent = "Bot";
					let opponentLevel = opponentQualifier.value;

					if (opponentType.value === "Human") 
					{ 
						opponent = opponentQualifier.value; 
						opponentLevel = "-1";
					}

					// THEN insert all values
					const insert = `INSERT INTO Battles VALUES (` +
						`"${moment().format()}", ` +
						`"${opponent.toLowerCase()}", ` +
						`${userStocks.value}, ` +
						`"${userFighter.value}", ` +
						`${opponentStocks.value}, ` + 
						`${opponentLevel}, ` +
						`${newTotalPct}, ` +
						`${newCharPct}, ` +
						`"${opponentFighter.value}");`;

					db.run(insert);
				});
			});
		});
	});

	// Fighters Table Operations
	let wins, losses, score, kd;

	const getAll = `SELECT Wins wins, Losses losses, Score score FROM Fighters WHERE Name="${userFighter.value}"`;

	db.all(getAll, (err, rows) => 
	{
		wins = won ? rows[0].wins + 1 : rows[0].wins;
		losses = won ? rows[0].losses : rows[0].losses + 1;
		score = getNewScore(rows[0].score);
		kd = (losses === 0) ? wins : wins / losses;

		const update = `UPDATE Fighters SET ` +
			`Wins=${wins}, ` +
			`Losses=${losses}, ` + 
			`Score=${score}, ` +
			`KD=${kd} WHERE Name="${userFighter.value}"`;

		db.run(update);
	});

	db.close();

	function getNewWinPct(wins, length)
	{
		if (won)
		{
			return (wins + 1) / (length + 1);
		}

		return (wins) / (length + 1);
	}

	function getNewScore(score)
	{
		let newScore;

		if (won)
		{
			newScore = 100 + 20 * Math.pow(1.2, parseInt(userStocks.value));
			if (opponentType.value === "Human")
			{
				newScore += 25;
			}
			else
			{
				newScore += 10 * Math.pow(1.1, parseInt(opponentQualifier.value));
			}
		}
		else
		{
			newScore = -50 - 20 * Math.pow(1.2, parseInt(opponentStocks.value));
			if (opponentType.value === "Human")
			{
				newScore += 25;
			}
			else
			{
				newScore += 5 * Math.pow(1.1, parseInt(opponentQualifier.value));
			}
		}

		if (score === 0)
		{
			return newScore;
		}
		else
		{
			return (score + newScore) / 2;
		}
	}
}

function createAlert(msg, stocks)
{
	let alert = document.createElement("div");
	alert.className = "siimple-alert siimple-alert--error";
	alert.textContent = msg;

	alertDiv.appendChild(alert);

	if (stocks)
	{
		userStocks.style = "border: 1px solid var(--red);";
		opponentStocks.style = "border: 1px solid var(--red);";
	}
	else
	{
		opponentQualifier.style = "border: 1px solid var(--red);";
	}
}

function titleCase(str) 
{
    return str.split(' ').map((val) => 
    { 
        return val.charAt(0).toUpperCase() + val.substr(1).toLowerCase();
    }).join(' ');
}

function autocomplete(inp, arr, img) 
{
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                updatePicture(inp.value, img)
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
} 