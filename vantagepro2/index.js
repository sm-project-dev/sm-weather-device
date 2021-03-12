require('dotenv').config();

const Control = require('./src/Control');

const config = require('./src/config');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  const control = new Control(config);

  control.init();

  // control.converter.setProtocolConverter(control.config.deviceInfo);
  // control.setDeviceClient(control.config.deviceInfo);

  process.on('uncaughtException', err => {
    // BU.debugConsole();
    console.trace(err);
    console.log('Node NOT Exiting...');
  });

  process.on('unhandledRejection', err => {
    // BU.debugConsole();
    console.trace(err);
    console.log('Node NOT Exiting...');
  });
}
