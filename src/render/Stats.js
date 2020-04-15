const sqlite = require("sqlite3");
const path = require("path");

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

    db.close();
}

function populateCharts()
{

}

// helper functions
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

        else if (value < min)
        {
            min = value;
            minLabel = key;
        }
    }

    return minLabel;
}

function $(id)
{
    return document.getElementById(id);
}