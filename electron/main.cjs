let mainWindow;
let splashWindow;

const { app, BrowserWindow, session } = require("electron");
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
      sandbox: false,
      preload: path.join(__dirname, "../preload/preload.mjs"),
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

app.whenReady().then(() => {
  const cspValue = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${isDev ? "http://localhost:5173 ws://localhost:5173" : ""}`.trim(),
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [cspValue],
      },
    });
  });

  createSplash();
  createMainWindow();
});
