const sqlite3 = require("sqlite3");
const path = require("path");
const { ipcRenderer } = require("electron");

// * Doc References
const fighterInput = document.getElementById("fighterInput");

const weight = document.getElementById("weight");
const speed = document.getElementById("speed");
const archetype = document.getElementById("archetype");

const fighterImage = document.getElementById("fighterImage");

const up = document.getElementById("up");
const side = document.getElementById("side");
const down = document.getElementById("down");
const neutral = document.getElementById("neutral");

const bio = document.getElementById("bio");

// * Event Listeners
fighterInput.onchange = () => { displayData(fighterInput.value); };

// * Variables
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

// * Main Loop
checkLoad();

autocomplete(fighterInput, acceptedFighters);

// * Functions
function checkLoad()
{
    ipcRenderer.send("checkFighterLoad");

    ipcRenderer.on("checkFighterLoad-reply", (event, arg) => 
    {
        displayData(arg);
    });
}

function displayData(fighter)
{
    // clean up in case previous fighter was Pokemon Trainer
    resetFont();

    // titleCase breaks the string "R.O.B."
    if (fighter !== "R.O.B.")
        fighter = titleCase(fighter);

    if (acceptedFighters.includes(fighter))
    {
        // database operations
        const db = new sqlite3.Database(path.join(__dirname, "../stats.db"));

        // get the stats
        const getStats = `SELECT Weight weight, Speed speed, Archetype archetype FROM Bios WHERE Name=\"${fighter}\"`;
        db.all(getStats, (err, rows) => 
        {
            weight.textContent = rows[0].weight;
            speed.textContent = rows[0].speed;
            archetype.textContent = rows[0].archetype;
        });

        // get the moves
        const getMoves = `SELECT Moves moves FROM Bios WHERE Name=\"${fighter}\"`;
        db.all(getMoves, (err, rows) =>
        {
            const moves = JSON.parse(rows[0].moves);
            
            up.textContent = moves.up;
            down.textContent = moves.down;
            side.textContent = moves.side;
            neutral.textContent = moves.neutral;
        });

        // get the bio blast
        const getBio = `SELECT Bio bio FROM Bios WHERE Name=\"${fighter}\"`;
        db.all(getBio, (err, rows) => 
        {
            bio.textContent = rows[0].bio;
        });

        // finally, update the image
        fighterImage.src = path.join(__dirname, `../assets/fighters_adjusted/${fighter}.png`);

        db.close();

        // add a final check to change font size if fighter is Pokemon Trainer
        if (fighter === "Pokemon Trainer")
        {
            const style = "font-size: 2.5vh; padding-top: 3%;"
            up.style = style;
            down.style = style;
            side.style = style;
            neutral.style = style;
        }
    }
}

function resetFont()
{
    up.style = "";
    down.style = "";
    side.style =  "";
    neutral.style = "";
}

function titleCase(str) 
{
    return str.split(' ').map((val) => 
    { 
        return val.charAt(0).toUpperCase() + val.substr(1).toLowerCase();
    }).join(' ');
}

function autocomplete(inp, arr) 
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
                displayData(inp.value);
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