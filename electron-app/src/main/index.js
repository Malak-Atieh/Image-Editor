import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path  from 'path'
import fs from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const getUserDataPath = (userId) => {
  return path.join(app.getPath('userData'), 'users', userId);
};

const getUserImagesDir = (userId) => {
  return path.join(getUserDataPath(userId), 'images');
};

const initUserDirectories = (userId) => {
  const userDir = getUserDataPath(userId);
  const imagesDir = getUserImagesDir(userId);
  
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  const dbPath = path.join(imagesDir, 'metadata.json');
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
  }
};

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
      nodeIntegration: true, // Enable if you need Node.js in renderer
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


ipcMain.handle('save-image', async (event, { userId, title, base64, type }) => {
  try {
    if (!userId) throw new Error('User ID is required');
    initUserDirectories(userId);
    const imagesDir = getUserImagesDir(userId);
    const dbPath = path.join(imagesDir, 'metadata.json');

    const extension = type.split('/')[1] || 'jpg'; 
    const safeTitle = title.replace(/[<>:"\/\\|?*]+/g, ''); 
    const fileName = `${Date.now()}-${safeTitle.substring(0, 20)}.${extension}`;
    const filePath = path.join(imagesDir, fileName);

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    const meta = {
      id: crypto.randomUUID(),
      title: safeTitle,
      fileName,
      path: filePath,
      type,
      size: buffer.length,
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
    };

    let db = [];
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }
    db.push(meta);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return { success: true, image: {
      ...meta,
       src: filePath
      } 
    };
  } catch (error) {
    console.error('Error saving image:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fetch-images', async (event, userId) => {
  if (!userId) return [];
  
  const imagesDir = getUserImagesDir(userId);
  const dbPath = path.join(imagesDir, 'metadata.json');

  if (!fs.existsSync(dbPath)) return [];

  try {
    const content = fs.readFileSync(dbPath, 'utf-8');
    if (!content.trim()) return [];
    
    const images = JSON.parse(content);
    
    const verifiedImages = images.filter(img => {
      try {
        return fs.existsSync(img.path);
      } catch {
        return false;
      }
    });
    
    if (verifiedImages.length !== images.length) {
      fs.writeFileSync(dbPath, JSON.stringify(verifiedImages, null, 2));
    }
    
    return verifiedImages;
  } catch (error) {
    console.error('Error fetching images:', error);
    return [];
  }
});

ipcMain.handle("get-image-data-url", async (event, {userId, imagePath}) => {
  try {
    const userImagesDir = getUserImagesDir(userId);
    if (!imagePath.startsWith(userImagesDir)) {
      throw new Error('Unauthorized access to image');
    }
    if (!fs.existsSync(imagePath)) {
      throw new Error('Image not found');
    }
    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).substring(1); 
    const mimeType = `image/${ext}` || 'image/jpeg';
    const base64 = imageBuffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error("Failed to read image:", error);
    return null;
  }
});

ipcMain.handle('delete-image', async (event, {userId, filePath}) => {
  console.log(`Deleting image: ${filePath}`);
  if (!userId || !filePath) return { success: false, error: 'User ID required' };

  const userImagesDir = getUserImagesDir(userId);
  const dbPath = path.join(userImagesDir, 'metadata.json');

  try {
    if (!filePath.startsWith(userImagesDir)) {
      throw new Error('Invalid file path for user');
    }
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Image file deleted successfully');

    }    
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      const updated = data.filter(img => img.path !== filePath);
      fs.writeFileSync(dbPath, JSON.stringify(updated, null, 2));
      console.log('Metadata updated successfully');

    }
    return { success: true };
  } catch (error) {
    console.error("Failed to delete image:", error);
    return { success: false, error: error.message };
  }
});


ipcMain.handle('save-edited-image', async (event, { 
  userId, 
  originalPath,
  base64Data,
  title,
  type 
}) => {
  try {
    if (!userId) throw new Error('User ID is required');

    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('No image data');
    }
    if (!base64Data.startsWith('data:image')) {
      throw new Error('Invalid image format - must be base64 encoded image');
    }

    initUserDirectories(userId);
    const imagesDir = getUserImagesDir(userId);
    const dbPath = path.join(imagesDir, 'metadata.json');

    const base64Content = base64Data.split(';base64,')[1];
    const buffer = Buffer.from(base64Content, 'base64');


    const extension = type.split('/')[1] || 'jpg';
    const newTitle = title.replace(/[^\w-]/g, '').substring(0, 20); 
    const fileName = `edited-${Date.now()}-${newTitle}.${extension}`;    
    const filePath = path.join(imagesDir, fileName);

    try {
      fs.writeFileSync(filePath, buffer);
    } catch (error) {
      throw new Error(`Failed to write image file: ${error.message}`);
    }

    let db = [];
    
    if (fs.existsSync(dbPath)) {
      try {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      } catch (error) {
        console.error('Error reading metadata:', error);
      }
    }

    const meta = {
      id: crypto.randomUUID(),
      title,
      fileName,
      path: filePath,
      isEdited: true,
      createdAt: new Date().toISOString(),
      editedAt: new Date().toISOString(),
      originalPath: originalPath ? path.basename(originalPath) : null,
      size: buffer.length
    };

    db.push(meta);
    try {
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      console.log('Metadata updated successfully');
    } catch (error) {
      console.error('Failed to update metadata:', error);
    }
    return { 
      success: true, 
      path: filePath,
      fileName,
      metadata: meta 
    };
  } catch (error) {
    console.error('Save error:', error);
    return { 
      success: false, 
      error: error.message  ,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined  
    };
  }
});