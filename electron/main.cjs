let mainWindow;
let splashWindow;

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;

function createSplash() {
  splashWindow = new BrowserWindow({
    width: 420,
    height: 260,
    useContentSize: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    show: true,
    backgroundColor: "#111111",
  });

  splashWindow.loadFile(path.join(app.getAppPath(), "electron", "splash.html"));
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "../preload/preload.cjs"),
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
    mainWindow.show();

    if (isDev) mainWindow.webContents.openDevTools();
  });
}

function createAdditionalWindow() {
  const newWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "../preload/preload.cjs"),
    },
  });

  if (isDev) {
    newWindow.loadURL("http://localhost:5173");
  } else {
    newWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  createSplash();
  createMainWindow();

  ipcMain.handle("app:new-job-window", () => {
    createAdditionalWindow();
  });
});
