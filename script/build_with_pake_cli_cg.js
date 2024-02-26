import shelljs from 'shelljs';
import axios from 'axios';
import fs from 'fs';
import {$} from 'zx'
const { exec, cd, mv } = shelljs;

console.log('Welcome to use pake-cli to build app');
console.log('Node.js info in your localhost ', process.version);
console.log('\n=======================\n');
console.log('Pake parameters is: ');
console.log('url: ', process.env.URL);
console.log('name: ', process.env.NAME);
console.log('icon: ', process.env.ICON);
console.log('height: ', process.env.HEIGHT);
console.log('width: ', process.env.WIDTH);
console.log('transparent: ', process.env.TRANSPARENT);
console.log('resize: ', process.env.RESIZE);
console.log('is multi arch? only for Mac: ', process.env.MULTI_ARCH);
console.log('targets type? only for Linux: ', process.env.TARGETS);
console.log('===========================\n');

cd('node_modules/pake-cli');
const params = process.env.NAME.split(',').map(name => {

  let _params = `node cli.js ${process.env.URL} --name ${process.env.MODE}${name} --height ${process.env.HEIGHT} --width ${process.env.WIDTH}`;

  if (process.env.TRANSPARENT === 'true') {
    _params = `${_params} --transparent`;
  }

  if (process.env.FULLSCREEN === 'true') {
    _params = `${_params} --resize`;
  }

  if (process.env.MULTI_ARCH === 'true') {
    exec('rustup target add aarch64-apple-darwin');
    _params = `${_params} --multi-arch`;
  }

  if (process.env.TARGETS) {
    _params = `${_params} --targets ${process.env.TARGETS}`;
  }

  if (process.platform === 'win32') {
    _params = `${_params} --show-system-tray`;
  }

  if (process.platform === 'linux') {
    _params = `${_params} --show-system-tray`;
  }

  if (process.platform === 'darwin') {
    _params = `${_params} --show-menu`;
  }
  return _params;
})

const downloadIcon = async iconFile => {
  try {
    const response = await axios.get(process.env.ICON, { responseType: 'arraybuffer' });
    fs.writeFileSync(iconFile, response.data);
  } catch (error) {
    console.error('Error occurred during icon download: ', error);
  }
};

const main = async () => {
  let iconFile;
  if (process.env.ICON && process.env.ICON !== '') {
    switch (process.platform) {
      case 'linux':
        iconFile = 'icon.png';
        break;
      case 'darwin':
        iconFile = 'icon.icns';
        break;
      case 'win32':
        iconFile = 'icon.ico';
        break;
      default:
        console.error("Unable to detect your OS system, won't download the icon!");
        process.exit(1);
    }

    await downloadIcon(iconFile);
  } else {
    console.error("Won't download the icon as ICON environment variable is not defined!");
  }

  console.log('Pake parameters is: ', params);
  console.log('Compile....');

  for (let param of params) {
    param = `${params} --icon ${iconFile}`;
    console.log('Build:', param);
    $`${param.split(' ')}`;
    console.log('Build Success:', param);
  }

  if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
  }
  process.env.NAME.split(',').forEach(name => {
    mv(`${name}.*`, 'output/');
  })
  console.log('Build Success');
  cd('../..');
};

main();
