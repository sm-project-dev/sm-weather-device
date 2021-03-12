const BU = require('base-util-jh').baseUtil;

global.BU = BU;

const Control = require('../src/Control');

const config = require('../src/config');

const control = new Control(config);
BU.CLI('왓 더');
control.setDeviceClient(control.config.deviceInfo);

const commandInfo = control.getDefaultCommandConfig();
commandInfo.hasOneAndOne = true;
commandInfo.cmdList['LOOP\n'];
BU.CLI(commandInfo);
setInterval(() => {
  control.executeCommand('LOOP\n');
  control.requestNextCommand();
}, 1000 * 60);
BU.CLI('왓 더');

process.on('uncaughtException', function(err) {
  // BU.debugConsole();
  console.error(err.stack);
  console.log(err.message);
  console.log('Node NOT Exiting...');
});

process.on('unhandledRejection', function(err) {
  // BU.debugConsole();
  console.error(err.stack);
  console.log(err.message);
  console.log('Node NOT Exiting...');
});
