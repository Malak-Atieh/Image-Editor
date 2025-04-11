
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path  from 'path'
import fs from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const imagesDir = path.join(app.getPath('userData'), 'images');


if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}
function createWindow() {
  console.log("Electron main process started...");

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false, 
      nodeIntegration: false, // Enable if you need Node.js in renderer
      contextIsolation: true // Required for some Electron versions
    }
  })
  
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools();

  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


ipcMain.handle('save-image', async (event, { title, base64, originalName, type }) => {
  try {
    const extension = type.split('/')[1]; // e.g. image/png → png
    const safeTitle = title.replace(/[<>:"\/\\|?*]+/g, ''); // remove invalid file characters
    const fileName = `${Date.now()}-${safeTitle}.${extension}`;
    const filePath = path.join(imagesDir, fileName);

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(filePath, base64Data, 'base64');

    // Save metadata (optional, or store in DB later)
    const meta = {
      title,
      fileName,
      path: filePath,
      uploadedAt: new Date().toISOString(),
    };

    const dbPath = path.join(imagesDir, 'metadata.json');
    let db = [];
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath));
    }
    db.push(meta);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return { success: true };
  } catch (err) {
    console.error('Error saving image:', err);
    return { success: false };
  }
});

ipcMain.handle('fetch-images', async () => {
  const dbPath = path.join(imagesDir, 'metadata.json');
  if (!fs.existsSync(dbPath)) return [];

  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
});

ipcMain.handle("get-image-data-url", async (event, imagePath) => {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = imagePath.split('.').pop(); // Get file extension
    return `data:image/${ext};base64,${base64}`;
  } catch (err) {
    console.error("Failed to read image:", err);
    return null;
  }
});

ipcMain.handle('delete-image', async (event, filePath) => {
  const dbPath = path.join(imagesDir, 'metadata.json');

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }    
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      const updated = data.filter(img => img.path !== filePath);
      fs.writeFileSync(dbPath, JSON.stringify(updated, null, 2));
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to delete image:", error);
    return { success: false, error: error.message };
  }
});