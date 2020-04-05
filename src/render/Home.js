// imports
const sqlite = require("sqlite3").verbose();
const path = require("path");

// global variables
const dbPath = path.join(__dirname, "../stats.db");

// doc references
const box1Left = document.getElementById("box1Left");
const box1Right = document.getElementById("box1Right");
const box2Left = document.getElementById("box2Left");
const box2Right = document.getElementById("box2Right");
const box3Left = document.getElementById("box3Left");
const box3Right = document.getElementById("box3Right");

const box1Img = document.getElementById("box1Img");
const box2Img = document.getElementById("box2Img");
const box3Img = document.getElementById("box3Img");

const mainImg = document.getElementById("mainImg");
const mainP = document.getElementById("mainP");

// data access functions
function getTop3(sortMethod)
{
    const db = new sqlite.Database(dbPath);
    
    const sql = "SELECT Name name, " + sortMethod + " sort FROM Fighters ORDER BY " + sortMethod + " DESC";

    db.all(sql, (err, rows) => 
    {
        if (err) { console.log(err); }

        db.close();
             
        // box 1
        const box1Name = rows[0].name;

        box1Left.textContent = box1Name;
        box1Right.textContent = rows[0].sort;

        box1Img.src = path.join(__dirname, "../assets/fighters", box1Name + ".png");

        // box 2
        const box2Name = rows[1].name;

        box2Left.textContent = box2Name;
        box2Right.textContent = rows[1].sort;

        box2Img.src = path.join(__dirname, "../assets/fighters", box2Name + ".png");

        // box 3
        const box3Name = rows[2].name;
        
        box3Left.textContent = rows[2].name;
        box3Right.textContent = rows[2].sort;

        box3Img.src = path.join(__dirname, "../assets/fighters", box3Name + ".png");
    });
}

function mainHighlight()
{
    const db = new sqlite.Database(dbPath);

    // load the json file
    const jsonLocation = path.join(__dirname, "../profile.json");

    const request = new XMLHttpRequest();
    request.open("GET", jsonLocation);
    request.responseType = "json";
    request.send(); 

    // set user's main for querying
    let main;
    request.onload = function()
    {
        main = request.response["mains"][0];

        // set up display
        mainImg.src = path.join(__dirname, "../assets/fighters", main + ".png");

        // query data
        const sql = "SELECT Wins wins, Score score, KD kd FROM Fighters WHERE Name=\"" + main + "\"";

        db.all(sql, (err, rows) => 
        {
            if (err) { console.log(err); }

            mainP.textContent = "Score: " + rows[0].score + "\n\n Wins: " + rows[0].wins + "\n\n KD: " + rows[0].kd;

            db.close();
        });
    }
}

// main logic
getTop3("Score");
mainHighlight();