let mainWindow;
let splashWindow;

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;

const { pathToFileURL } = require("url");

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

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const csp = isDev
      ? "default-src 'self'; script-src 'self' http://localhost:5173; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws://localhost:5173 http://localhost:5173; font-src 'self' data:"
      : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self' data:";

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [csp],
      },
    });
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
