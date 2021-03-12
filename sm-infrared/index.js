const Control = require('./src/Control');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  const {BU} = require('base-util-jh');

  const config = require('./src/config');

  const control = new Control(config);

  // let defaultCommandInfo = control.getDefaultCommandConfig();
  // BU.CLI(defaultCommandInfo);

  control.init();

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
