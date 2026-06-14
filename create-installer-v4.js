const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const electronInstaller = require('electron-winstaller');

async function createInstaller() {
    try {
        console.log('Creating Windows installer from existing build...');

        // Path to the existing build
        const appPath = path.join(__dirname, 'dist-desktop-3', 'win-unpacked');

        if (!fs.existsSync(appPath)) {
            throw new Error('Build directory does not exist: ' + appPath);
        }

        console.log('Using existing build at:', appPath);

        // Check if the required files exist
        const requiredFiles = ['resources', 'resources.pak', 'snapshot_blob.bin', 'v8_context_snapshot.bin'];
        for (const file of requiredFiles) {
            const filePath = path.join(appPath, file);
            if (!fs.existsSync(filePath)) {
                console.log('Missing file:', filePath);
            } else {
                console.log('Found file:', filePath);
            }
        }

        // Create a simple directory structure for the installer
        const installerDir = path.join(__dirname, 'installer-temp');
        if (fs.existsSync(installerDir)) {
            fs.rmSync(installerDir, { recursive: true, force: true });
        }
        fs.mkdirSync(installerDir, { recursive: true });

        // Copy the existing build to a temporary location
        console.log('Copying build files...');
        const tempAppDir = path.join(installerDir, 'FaridShopApp-win32-x64');
        fs.cpSync(appPath, tempAppDir, { recursive: true });

        // Create a package.json for the installer
        const packageJson = {
            name: "farid-shop-app",
            version: "0.1.0",
            description: "Farid Shop Application",
            main: "index.js",
            scripts: {
                "start": "electron ."
            },
            author: "",
            license: "ISC"
        };

        fs.writeFileSync(path.join(tempAppDir, 'package.json'), JSON.stringify(packageJson, null, 2));

        // Create a simple index.js file
        const indexJs = `
const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');

let mainWindow;
let server;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'icon.png')
    });

    // Load the app
    mainWindow.loadFile('index.html');

    // Remove menu bar for cleaner look
    mainWindow.setMenu(null);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
`;

        fs.writeFileSync(path.join(tempAppDir, 'index.js'), indexJs);

        console.log('Creating installer...');

        // Create installer options
        const options = {
            name: 'FaridShopApp',
            appDirectory: tempAppDir,
            outputDirectory: path.join(__dirname, 'installers'),
            authors: 'Farid Shop',
            description: 'Farid Shop Application',
            version: '0.1.0',
            title: 'Farid Shop App',
            exe: 'FaridShopApp.exe',
            setupExe: 'FaridShopAppInstaller.exe',
            noMsi: true,
            skipUpdateIcon: true,
            setupIcon: path.join(__dirname, 'public', 'icon.png'),
            iconUrl: path.join(__dirname, 'public', 'icon.png'),
            loadingGif: path.join(__dirname, 'public', 'icon.png')
        };

        // Create the installer
        const result = await electronInstaller.createWindowsInstaller(options);

        console.log('Installer created successfully!');
        console.log('Installer saved to:', path.join(__dirname, 'installers', 'FaridShopAppInstaller.exe'));

        // Clean up temporary files
        fs.rmSync(installerDir, { recursive: true, force: true });

        return result;

    } catch (error) {
        console.error('Error creating installer:', error.message);
        console.error('Stack trace:', error.stack);
        throw error;
    }
}

createInstaller().catch(console.error);