const electronInstaller = require('electron-winstaller');

const options = {
  appDirectory: 'dist-desktop-4/Farid Shop App-win32-x64',
  outputDirectory: 'dist-desktop-4/installers',
  authors: 'Farid Shop',
  description: 'Farid Shop App - Aplikasi Manajemen Akun',
  exe: 'Farid Shop App.exe',
  noMsi: true,
  noIcon: true,
  title: 'Farid Shop App',
  name: 'Farid Shop App',
  version: '0.1.0'
};

console.log('Creating Windows installer (without custom icon)...');

electronInstaller.createWindowsInstaller(options)
  .then(() => console.log('Successfully created installer at: ' + options.outputDirectory))
  .catch(err => {
    console.error('Error creating installer:', err);
    process.exit(1);
  });