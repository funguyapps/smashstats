const { ipcRenderer } = require("electron");
const path = require("path");

// doc references
const nameInput = document.getElementById("nameInput");
const main1Input = document.getElementById("main1Input");
const main2Input = document.getElementById("main2Input");

const finishButton = document.getElementById("finishButton");

const formTitle = document.getElementById("formTitle");

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

// set up event listeners
finishButton.onclick = validate;
autocomplete(main1Input, acceptedFighters);
autocomplete(main2Input, acceptedFighters);

// * main logic
ipcRenderer.send("checkProfile");

ipcRenderer.on("checkProfile-reply", (event, args) => 
{
    if (args)
    {
		  formTitle.textContent = "Update Your Profile";
		  setJSONValues();
    }
});

// * Functions
function validate()
{
    const name = nameInput.value;
    const main1 = titleCase(main1Input.value);
    const main2 = titleCase(main2Input.value);

    if (name !== "" && main1 !== "") // check that required fields are filled
    {
        if (acceptedFighters.includes(main1)) // check that main1 is acceptable
        {
            if ((main2Input.value !== "" && acceptedFighters.includes(main2)) || main2Input.value === "") // checks if main2 is valid if given
            {
                const profile = 
                {
                    name: name,
                    mains: [
                        main1,
                        main2
                    ]
                }
                
                ipcRenderer.send("createProfile", profile);
                finishButton.href = "./Home.html";
            }
        }
    }
}

function setJSONValues()
{
	// load the json file
	const jsonLocation = path.join(__dirname, "../profile.json");

	const request = new XMLHttpRequest();
	request.open("GET", jsonLocation);
	request.responseType = "json";
	request.send(); 

	request.onload = function()
	{
		nameInput.value = request.response["name"];
		main1Input.value = request.response["mains"][0];
		main2Input.value = request.response["mains"][1];
	}
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