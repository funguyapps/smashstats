const sqlite = require("sqlite3");
const path = require("path");
const moment = require("moment");
const chart = require("chart.js");

// * Doc References
const fighterInput = $("fighterInput");
const quickSheetBox = $("quickSheetBox");

const fighterImg = $("fighterImg");

const bestMatchup = $("bestMatchup");
const worstMatchup = $("worstMatchup");
const quartileLabel = $("quartileLabel");
const quartileFilterSelect = $("quartileFilterSelect");

const winPctChart = $("winPctChart");
const nearestNeighborChart = $("nearestNeighborChart");
const nearestNeighborFilterSelect = $("nearestNeighborFilterSelect");

// * Event Listeners
fighterInput.onchage = () => { populateData(fighterInput.value); populateCharts(fighterInput.value, true); }
nearestNeighborFilterSelect.onchange = () => { populateCharts(fighterInput.value, false); }

// * Variables
const dbPath = path.join(__dirname, "../stats.db");

let chartObject;
let nearestNeighborData = [];
let nearestNeighborLabels = [];

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
autocomplete(fighterInput, acceptedFighters);

// * Functions
function populateData(fighter)
{
    if (fighter !== "R.O.B.")
        fighter = titleCase(fighter);

    // first, load the img
    fighterImg.src = path.join(__dirname, `../assets/fighters_adjusted/${fighter}.png`);

    // then populate quick sheet
    populateQuickSheet();

    function populateQuickSheet()
    {
        const db = new sqlite.Database(dbPath);

        const getStats = `SELECT Score score, KD kd, Wins wins FROM Fighters WHERE Name="${fighter}"`;

        db.all(getStats, (err, rows) =>
        {
            quickSheetBox.innerHTML = `<b style="color: var(--green); font-size: 6vh;">${rows[0].score}</b> score <br>` + 
            `<b style="color: var(--green); font-size: 6vh;">${rows[0].wins}</b> wins <br>` + 
            `<b style="color: var(--green); font-size: 6vh;">${rows[0].kd}</b> kd`;
        });

        db.close();
    }
}

function populateCharts(fighter, showBoth)
{
    if (fighter !== "R.O.B.")
        fighter = titleCase(fighter);

    if (fighter === "")
        return;

    const db = new sqlite.Database(dbPath);

    if (showBoth || typeof(showBoth) === typeof(undefined))
    {
        populateWinPct();
    }

    populateNearestNeighbors(nearestNeighborFilterSelect.value);

    db.close();

    function populateWinPct()
    {
        const sql = `SELECT CharWinPct winPct, Meta date FROM Battles WHERE User_Fighter="${fighter}"`;

        db.all(sql, (err, rows) => 
        {
            if (rows.length === 0 || typeof(rows) === typeof(undefined)) { return; }
            let data = [];
            let labels = [];

            rows.map((value) => { data.push(value.winPct); });
            rows.map((value) => { labels.push(""); });

            if (rows.length === 1)
            {
                data.push(rows[0].winPct);
                labels.push("");
            }

            labels[0] = moment(rows[0].date).format("MM/DD");
            labels[labels.length - 1] = moment(rows[rows.length - 1].date).format("MM/DD");

            new chart(winPctChart, 
                {
                    type: "line",
                    data: 
                    {
                        labels: labels,
                        fontColor: "#1b1b1b",
                        datasets: 
                        [
                            {
                                data: data,
                                fill: false,
                                backgroundColor: "#14E870",
                                borderColor: "#14E870",
                            }
                        ],
                    },
                    options:
                    {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout:
                        {
                            padding:
                            {
                                top: 20,
                                left: 10
                            },
                        },
                        title:
                        {
                            display: false,
                        },
                        legend:
                        {
                            display: false,
                        },
                        elements: 
                        { 
                            point: 
                            { 
                                radius: 0 
                            } 
                        },
                        scales: 
                        {
                            yAxes:
                            [
                                {
                                    display: true,
                                    ticks: 
                                    {
                                        min: 0,
                                        max: 1,
                                        fontColor: "#1b1b1b",
                                    },
                                    gridLines:
                                    {
                                        display: false,
                                    }
                                }
                            ],
                            xAxes:
                            [
                                {
                                    display: true,
                                    ticks:
                                    {
                                    fontColor: "#1b1b1b",  
                                    },
                                    gridLines:
                                    {
                                        display: false,
                                    }
                                }
                            ]
                        }
                    }
                })
        });
    }

    function populateNearestNeighbors(sortMethod)
    {
        const sql = `SELECT Name as Name, ${sortMethod} as sort FROM Fighters WHERE ${sortMethod} != 0 ORDER BY ${sortMethod} DESC`;

        nearestNeighborData = [];
        nearestNeighborLabels = [];

        db.all(sql, (err, rows) =>
        {
            if (rows.length === 0)
            {
                return;
            }

            let index = -1;
            let j = 0;
            rows.map((row) =>
            {
                if (row.Name === fighter)
                {
                    index = j;
                }

                j++;
            });

            if (index === -1) { return; }

            if (rows.length < 5)
            {
                for (let i = 0; i < rows.length; i++)
                {
                    nearestNeighborData.push(rows[i].sort);
                    nearestNeighborLabels.push(rows[i].Name);
                }
            }
            else
            {
                // normal operation
                if (rows[0].Name === fighter || rows[1].Name === fighter)
                {
                    // special case; fighter is first or second
                    for (let i = 0; i < 5; i++)
                    {
                        nearestNeighborData.push(rows[i].sort);
                        nearestNeighborLabels.push(rows[i].Name);
                    }
                }
                else if (rows[rows.length - 2] === fighter || rows[rows.length - 1] === fighter)
                {
                    // special case; fighter is 2nd-to-last OR last
                    for (let i = 1; i < 6; i++)
                    {
                        nearestNeighborData.push(rows[rows.length - i].sort);
                        nearestNeighborLabels.push(rows[rows.length - i].Name);
                    }
                }
                else
                {
                    for (let i = index - 2; i < index + 2; i++)
                    {
                        nearestNeighborData.push(rows[i].sort);
                        nearestNeighborLabels.push(rows[i].Name);
                    }
                }
            }

            if (typeof(chartObject) !== typeof(undefined))
            {
                chartObject.destroy();
            }

            chartObject = new chart(nearestNeighborChart, 
                {
                    type: "horizontalBar",
                    data: 
                    {
                        labels: nearestNeighborLabels,
                        fontColor: "#1b1b1b",
                        datasets: 
                        [
                            {
                                data: nearestNeighborData,
                                fill: false,
                                backgroundColor: nearestNeighborLabels.map((name) => 
                                { 
                                    if (fighter === name)
                                    {
                                        return "#14E870";
                                    }
                                    else
                                    {
                                        return "#1b1b1b";
                                    }
                                }),
                                borderColor: "#14E870",
                            }
                        ],
                    },
                    options:
                    {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout:
                        {
                            padding:
                            {
                                top: 0,
                                left: 2,
                                bottom: 45,
                                right: 10
                            },
                        },
                        title:
                        {
                            display: false,
                        },
                        legend:
                        {
                            display: false,
                        },
                        elements: 
                        { 
                            point: 
                            { 
                                radius: 0 
                            } 
                        },
                        scales: 
                        {
                            yAxes:
                            [
                                {
                                    display: true,
                                    ticks: 
                                    {
                                        min: 0,
                                        max: 1,
                                        fontColor: "#1b1b1b",
                                    },
                                    gridLines:
                                    {
                                        display: false,
                                    }
                                }
                            ],
                            xAxes:
                            [
                                {
                                    display: false,
                                    ticks: 
                                    {
                                        min: 0,
                                    },
                                }
                            ]
                        }
                    }
                });
        });
    }
}

// helper functions
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
                populateData(inp.value);
                populateCharts(inp.value);
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

function $(id)
{
    return document.getElementById(id);
}