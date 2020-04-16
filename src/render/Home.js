// imports
const sqlite = require("sqlite3").verbose();
const path = require("path");
const moment = require("moment");
const chart = require("chart.js");
const { ipcRenderer } = require("electron");

// global variables
const dbPath = path.join(__dirname, "../stats.db");
let currentMain;
let box1Name, box2Name, box3Name;

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

const mainImgLink = document.getElementById("mainImgLink");
const box1Link = document.getElementById("box1Link");

const winProgressionCanvas = document.getElementById("winProgressionCanvas");
const currentWinPct = document.getElementById("currentWinPct");

const filterSelect = document.getElementById("filterSelect");

// set up event listeners
filterSelect.onchange = () => { getTop3(filterSelect.value) };

mainImgLink.onclick = () => { readyFighterLoad(currentMain); };
box1Link.onclick = () => { readyFighterLoad(box1Name); };
box2Link.onclick = () => { readyFighterLoad(box2Name); };
box3Link.onclick = () => { readyFighterLoad(box3Name); };

// data access functions
function readyFighterLoad(fighter)
{
    ipcRenderer.send("setFighterLoad", fighter);
}

function getTop3(sortMethod)
{
    const db = new sqlite.Database(dbPath);
    
    const sql = "SELECT Name name, " + sortMethod + " sort FROM Fighters ORDER BY " + sortMethod + " DESC";

    db.all(sql, (err, rows) => 
    {
        if (err) { console.log(err); }

        db.close();

        // box 1
        if (rows[0].sort === 0) { return; }
        box1Name = rows[0].name;

        box1Left.textContent = box1Name;
        box1Right.textContent = rows[0].sort;

        box1Img.src = path.join(__dirname, "../assets/fighters", box1Name + ".png");

        // box 2
        if (rows[1].sort === 0) { return; }
        box2Name = rows[1].name;

        box2Left.textContent = box2Name;
        box2Right.textContent = rows[1].sort;

        box2Img.src = path.join(__dirname, "../assets/fighters", box2Name + ".png");

        // box 3
        if (rows[2].sort === 0) { return; }
        box3Name = rows[2].name;
        
        box3Left.textContent = rows[2].name;
        box3Right.textContent = rows[2].sort;

        box3Img.src = path.join(__dirname, "../assets/fighters_adjusted", box3Name + ".png");

    });
}

function mainHighlight()
{

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

        setMainData(main);

        // add a cycle button if more than 1 main
        if (request.response["mains"][1] !== "")
        {
            const nextMain = request.response["mains"][1];

            let button = document.createElement("button");
            button.textContent = `${nextMain}`
            button.className = "siimple-btn";
            button.style = "background-color: var(--blue);";
            button.onclick = () => 
            { 
                flipMain(button, main, nextMain);
            };

            currentMain = main;

            document.getElementById("cycleButton").appendChild(button);
        }
    }
}

function flipMain(button, main1, main2)
{
    if (button.textContent === main1)
    {
        button.textContent = main2;
        setMainData(main1);
        currentMain = main1;
    }
    else
    {
        button.textContent = main1;
        setMainData(main2);
        currentMain = main2;
    }
}

function setMainData(main)
{
    const db = new sqlite.Database(dbPath);

    // set up display
    mainImg.src = path.join(__dirname, "../assets/fighters_adjusted", main + ".png");

    // query data
    const sql = "SELECT Wins wins, Score score, KD kd FROM Fighters WHERE Name=\"" + main + "\"";

    db.all(sql, (err, rows) => 
    {
        if (err) { console.log(err); }

        mainP.textContent = "Score: " + rows[0].score + "\n\n Wins: " + rows[0].wins + "\n\n KD: " + rows[0].kd;

        db.close();
    });
}

function winProgression()
{
    const db = new sqlite.Database(dbPath);

    const sql = "SELECT WinPct winPct, Meta date FROM Battles";

    db.all(sql, (err, rows) => 
    {
        if (rows.length === 0) { db.close(); return; }
        let data = [];
        let labels = [];

        rows.map((value) => { data.push(value.winPct); });
        rows.map((value) => { labels.push(""); });

        labels[0] = moment(rows[0].date).format("MM/DD");
        labels[labels.length - 1] = moment(rows[rows.length - 1].date).format("MM/DD");

        currentWinPct.textContent = `Win % Progression (now ${((rows[rows.length - 1].winPct) * 100).toFixed(2)}%)`;

        new chart(winProgressionCanvas, 
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
                            backgroundColor: "#0062ff",
                            borderColor: "#0062ff",
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

// main logic
getTop3("Score");
mainHighlight();
winProgression();