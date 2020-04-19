const sqlite = require("sqlite3");
const path = require("path");
const chart = require("chart.js");

// * Doc References
const mainComparisonChart = $("mainComparisonChart");
const playPctBots = $("playPctBots");
const playPctFighter = $("playPctFighter");

const hardestOpponent = $("hardestOpponent");
const bestArchetype = $("bestArchetype");
const worstArchetype = $("worstArchetype");

// * Vars
const dbPath = path.join(__dirname, "../stats.db");

let archetypeAverages = 
{
    "rush-down": 0, 
    "heavy": 0, 
    "combo": 0, 
    "swordy": 0, 
    "zoner": 0, 
    "floaty": 0
}

let archetypeCounts = 
{
    "rush-down": 26, 
    "heavy": 8, 
    "combo": 11, 
    "swordy": 9, 
    "zoner": 24, 
    "floaty": 2
};

let archetypeScores = 
{
    "rush-down": 0, 
    "heavy": 0, 
    "combo": 0, 
    "swordy": 0, 
    "zoner": 0, 
    "floaty": 0
}

const fighters = [
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
populateStats();
populateCharts();

// * Functions
function populateStats()
{
    const db = new sqlite.Database(dbPath);

    // for each fighter in fighters
    fighters.map((fighter) => 
    {
        const getArchetype = `SELECT Archetype archetype FROM Bios WHERE Name="${fighter}"`;

        // get the archetype first
        db.all(getArchetype, (err, rows) => 
        {
            let archetype = rows[0].archetype;

            const getScore = `SELECT Score score FROM Fighters WHERE Name="${fighter}"`;

            db.all(getScore, (err, rows) =>
            {
                let score = rows[0].score;

                // increase that archetype's total score
                archetypeScores[archetype] += score;

                // compute the average w/ hard-coded totals
                archetypeAverages[archetype] = archetypeScores[archetype]/archetypeCounts[archetype];

                // update the label each loop
                // TODO: find a way to implement this w/ async stuff instead of every loop
                bestArchetype.textContent = max(archetypeAverages);
                worstArchetype.textContent = min(archetypeAverages);
            });
        });
    });

    // finally, the HARDEST OPPONENT

    const getHardest = `SELECT Opponent opponent,
                            COUNT(Opponent) AS "times"
                            FROM Battles
                            WHERE Bot_Level == -1
                            GROUP BY Opponent
                            ORDER BY "times" DESC
                            LIMIT 1`;

    db.all(getHardest, (err, rows) => 
    {
        if (rows.length === 0) { hardestOpponent.textContent = "None Found"; return; }
        hardestOpponent.textContent = rows[0].opponent;
    });

    db.close();
}

function populateCharts()
{
    const db = new sqlite.Database(dbPath);

    // * Play Time vs. Bots, People

    const getVersusBots = "SELECT Count(*) as times FROM Battles WHERE Bot_Level != -1;";
    const getVersusOthers = "SELECT Count(*) as times FROM Battles WHERE Bot_Level == -1";

    let data = [];

    db.all(getVersusBots, (err, rows) => 
    {
        data.push(rows[0].times);

        db.all(getVersusOthers, (err, rows) =>
        {
            data.push(rows[0].times);

            // Play Pct vs. Bot
            new chart(playPctBots, 
                {
                    type: "doughnut",
                    data: 
                    {
                        labels: ["Against Bots", "All Others"],
                        fontColor: "#1b1b1b",
                        datasets: 
                        [
                            {
                                data: data,
                                backgroundColor: ["#14E870", "#0062ff"],
                                borderColor: "#6d6d6d",
                            }
                        ],
                    },
                    options:
                    {
                        responsive: true,
                        maintainAspectRatio: false,
                        title:
                        {
                            display: false,
                        },
                        legend:
                        {
                            labels:
                            {
                                fontColor: "#1b1b1b",
                            }
                        }
                    }
                });
        });
    });

    // * Play Time As Top 5 Most Frequent Fighters

    const getFighterFrequency = "SELECT User_Fighter name, COUNT(User_Fighter) AS times FROM Battles GROUP BY User_Fighter ORDER BY times DESC";
    const getAll = "SELECT Count(*) times FROM Battles";

    let nextData = [];
    let labels = [];

    db.all(getAll, (err, rows) =>
    {
        nextData.push(rows[0].times);
        labels.push("All Others");

        db.all(getFighterFrequency, (err, rows) => 
        {
            for (let i = 0; i < rows.length; i++)
            {
                if (i == 4)
                {
                    break;
                }

                nextData[0] -= rows[i].times;
                nextData.push(rows[i].times);
                labels.push(rows[i].name);
            }

            new chart(playPctFighter, 
                {
                    type: "doughnut",
                    data: 
                    {
                        labels: labels,
                        fontColor: "#1b1b1b",
                        datasets: 
                        [
                            {
                                data: nextData,
                                backgroundColor: ["#14E870", "#0062ff", "#ffe800", "#c20000", "#1b1b1b"],
                                borderColor: "#6d6d6d",
                            }
                        ],
                    },
                    options:
                    {
                        responsive: true,
                        maintainAspectRatio: false,
                        title:
                        {
                            display: false,
                        },
                        legend:
                        {
                            labels:
                            {
                                fontColor: "#1b1b1b",
                            }
                        },
                        layout:
                        {
                            padding:
                            {
                                right: 15,
                                top: 0,
                                left: 0,
                                bottom: 0
                            }
                        }
                    }
                });
        });
    });

    // * Score of Main(s) vs. Next Top 5

    getMains((mains) =>
    {
        let others = (mains.length == 1) ? 5 : 4;

        const getBoth = `SELECT Name name, Score score FROM Fighters WHERE Score != 0 AND Name="${mains[0]}" OR Name="${mains[1]}"`;

        let data = [];
        let labels = [];

        // get the scores of the mains
        db.all(getBoth, (err, rows) =>
        {
            if (err) { console.log(err); }
            if (rows.length == 0) { return; }
            rows.map((row) =>
            {
                data.push(row.score);
                labels.push(row.name);
            });

            const getRest = `SELECT Name name, Score score FROM Fighters WHERE NAME != "${mains[0]}" AND Name != "${mains[1]}" AND Score != 0 ORDER BY Score DESC`;

            db.all(getRest, (err, rows) =>
            {
                for (let i = 0; i < others; i++)
                {
                    data.push(rows[i].score);
                    labels.push(rows[i].name);
                }

                // create chart
                new chart(mainComparisonChart, 
                    {
                        type: "horizontalBar",
                        data:
                        {
                            labels: labels,
                            fontColor: "#1b1b1b",
                            datasets: 
                            [
                                {
                                    data: data,
                                    backgroundColor: labels.map((name) => 
                                    { 
                                        if (mains.includes(name))
                                        {
                                            return "#14E870";
                                        }
                                        else
                                        {
                                            return "#1b1b1b";
                                        }
                                    }),
                                    borderColor: "#6d6d6d",
                                }
                            ],
                        },
                        options:
                        {
                            responsive: true,
                            maintainAspectRatio: false,
                            title:
                            {
                                display: false,
                            },
                            legend:
                            {
                                display: false,
                            },
                            scales: 
                            {
                                yAxes:
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
                                ],
                                xAxes:
                                [
                                    {
                                        display: false,
                                    }
                                ]
                            }
                        }
                    });
            });
        });
    });

    db.close();
}

// helper functions
function getMains(callback)
{
    // load the json file
    const jsonLocation = path.join(__dirname, "../profile.json");

    const request = new XMLHttpRequest();
    request.callback = callback;
    request.open("GET", jsonLocation);
    request.responseType = "json";
    request.send(); 

    request.onload = () => { callback(request.response["mains"]) };
}

function max(dict)
{
    let max;
    let maxLabel;
    
    for (key in dict)
    {
        let value = dict[key];

        if (isNaN(value))
            continue;

        if (typeof(max) === typeof(undefined))
        {
            max = value;
            maxLabel = key;
        }

        else if (value > max)
        {
            max = value;
            maxLabel = key;
        }
    }

    if (max === 0)
    {
        return "None";
    }
    return maxLabel;
}

function min(dict)
{
    let min;
    let minLabel;
    
    for (key in dict)
    {
        let value = dict[key];

        if (isNaN(value))
            continue;

        if (typeof(min) === typeof(undefined))
        {
            min = value;
            minLabel = key;
        }

        else if (value != 0 && value < min)
        {
            min = value;
            minLabel = key;
        }
    }

    if (min === 0)
    {
        return "None";
    }
    return minLabel;
}

function $(id)
{
    return document.getElementById(id);
}