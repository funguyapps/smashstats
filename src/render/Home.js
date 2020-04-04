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
        box1Left.textContent = rows[0].name;
        box1Right.textContent = rows[0].sort;

        // box 2
        box2Left.textContent = rows[1].name;
        box2Right.textContent = rows[1].sort;

        // box 3
        box3Left.textContent = rows[2].name;
        box3Right.textContent = rows[2].sort;
    });
}

// main logic
getTop3("Score");