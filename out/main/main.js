import require$$0 from "electron";
import require$$1 from "path";
import require$$2 from "url";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var main$1 = {};
var hasRequiredMain;
function requireMain() {
  if (hasRequiredMain) return main$1;
  hasRequiredMain = 1;
  let mainWindow;
  let splashWindow;
  const { app, BrowserWindow } = require$$0;
  const path = require$$1;
  const isDev = !app.isPackaged;
  const { pathToFileURL } = require$$2;
  function createSplash() {
    splashWindow = new BrowserWindow({
      width: 420,
      height: 260,
      useContentSize: true,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      show: true,
      backgroundColor: "#111111"
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
        preload: path.join(__dirname, "../preload/preload.mjs")
      }
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
    createSplash();
    createMainWindow();
  });
  return main$1;
}
var mainExports = requireMain();
const main = /* @__PURE__ */ getDefaultExportFromCjs(mainExports);
export {
  main as default
};
