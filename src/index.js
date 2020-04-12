const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => 
{
  const mainWindow = new BrowserWindow({
	width: 1200,
	height: 900,
	frame: false,
	webPreferences: 
	{
	  nodeIntegration: true,
	},
  });

  if (fs.existsSync(path.join(__dirname, "profile.json")))
  {
    mainWindow.loadFile(path.join(__dirname, 'pages/Home.html'));

    // debug purposes only! uncomment line above for prod
    //mainWindow.loadFile(path.join(__dirname, 'pages/EditProfile.html'));
  }
  else
  {
	mainWindow.loadFile(path.join(__dirname, "pages/EditProfile.html"));
  }
  mainWindow.maximize();
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
	app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
	createWindow();
  }
});

ipcMain.on("createProfile", (event, args) => 
{
	fs.writeFileSync(path.join(__dirname, "profile.json"), JSON.stringify(args));
});

ipcMain.on("checkProfile", (event, arg) => 
{
	event.reply("checkProfile-reply", fs.existsSync(path.join(__dirname, "profile.json")));
});
