const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');

// Setup local Express server to serve Next.js static export
const PORT = 3000;
const expressApp = express();
const staticDir = path.join(__dirname, 'out');

expressApp.use(express.static(staticDir));
// For Client-Side Routing fallback
expressApp.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
});

let server;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "Farid Shop App",
        icon: path.join(__dirname, 'public', 'icon.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Remove menu bar
    mainWindow.setMenuBarVisibility(false);

    // Load the local express server
    mainWindow.loadURL(`http://localhost:${PORT}`);
}

app.whenReady().then(() => {
    server = expressApp.listen(PORT, () => {
        console.log(`Local server running on http://localhost:${PORT}`);
        createWindow();
    });

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (server) {
        server.close();
    }
    if (process.platform !== 'darwin') app.quit();
});
