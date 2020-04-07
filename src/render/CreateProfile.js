const { ipcRenderer } = require("electron");

// doc references
const nameInput = document.getElementById("nameInput");
const main1Input = document.getElementById("main1Input");
const main2Input = document.getElementById("main2Input");

const finishButton = document.getElementById("finishButton");

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

// functions
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

function titleCase(str) 
{
    return str.split(' ').map((val) => 
    { 
        return val.charAt(0).toUpperCase() + val.substr(1).toLowerCase();
    }).join(' ');
}