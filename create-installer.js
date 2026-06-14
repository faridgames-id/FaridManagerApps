const installer = require('electron-installer-windows');

const options = {
  src: 'dist-desktop-4/Farid Shop App-win32-x64',
  dest: 'dist-desktop-4/installers',
  name: 'Farid Shop App',
  productName: 'Farid Shop App',
  version: '0.1.0',
  icon: 'public/icon.png',
  background: 'public/installer-bg.jpg',
  setupIcon: 'public/icon.png',
  license: 'LICENSE',
  manufacturersName: 'Farid Shop',
  noMsi: true
};

console.log('Creating Windows installer...');

installer(options)
  .then(() => console.log('Successfully created installer at: ' + options.dest))
  .catch(err => {
    console.error('Error creating installer:', err);
    process.exit(1);
  });