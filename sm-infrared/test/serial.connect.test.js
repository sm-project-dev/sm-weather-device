const serialport = require('serialport');

const client = new serialport('COM4', {
  baudRate: 9600,
});

client.on('data', bufferData => {
  console.log('bufferData', bufferData.toString());
});

client.on('close', err => {
  console.log('close');
});

client.on('end', () => {
  console.log('Close');
});

client.on('error', error => {
  console.log('error');
});