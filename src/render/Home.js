const sqlite = require("sqlite3").verbose();

const path = __dirname + "/../stats.db";

async function getTop3(sortMethod)
{
    const db = new sqlite.Database(path);
    
    const sql = "SELECT Name name FROM Fighters ORDER BY ? DESC";

    await db.all(sql, [sortMethod], (err, rows) => 
    {
        if (err) {console.log(err);}

        console.log(rows);

        db.close();
    
        return rows;
    });
}

let results = getTop3("Score");

console.log(results);