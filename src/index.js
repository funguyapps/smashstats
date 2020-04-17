const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

let fighterLoad;

if (require("electron-squirrel-startup"))
{
    app.quit();
}

function createWindow()
{
    const mainWindow = new BrowserWindow(
        {
            width: 1200,
            height: 900,
            frame: false,
            webPreferences:
            {
                nodeIntegration: true,
            },
        }
    );

    if (fs.existsSync(path.join(__dirname, "profile.json")))
    {
        // mainWindow.loadFile(path.join(__dirname, "pages/Home.html"));

        // ! Debug Only. Uncomment above line for Prod.
        mainWindow.loadFile(path.join(__dirname, "pages/CharacterStats.html"));
    }
    else
    {
        mainWindow.loadFile(path.join(__dirname, "pages/EditProfile.html"));
    }

    mainWindow.maximize();

    // ! Debub Only. Uncomment below for Prod.
    mainWindow.webContents.openDevTools();
}

app.on("ready", createWindow);

app.on("window-all-closed", () =>
{
    if (process.platform !== "darwin")
    {
        app.quit();
    }
});

app.on("activate", () =>
{
    if (BrowserWindow.getAllWindows().length === 0)
    {
        createWindow();
    }
});

ipcMain.on("createProfile", (event, arg) =>
{
    fs.writeFileSync(path.join(__dirname, "profile.json"), JSON.stringify(arg));
});

ipcMain.on("checkProfile", (event, arg) =>
{
    event.reply("checkProfile-reply", fs.existsSync(path.join(__dirname, "profile.json")));
});

ipcMain.on("setFighterLoad", (event, arg) =>
{
    fighterLoad = arg;
});

ipcMain.on("checkFighterLoad", (event, arg) =>
{
    event.reply("checkFighterLoad-reply", fighterLoad);
});