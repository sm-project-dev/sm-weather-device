const expect = require('chai').expect;
const _ = require('lodash');
const BU = require('base-util-jh').baseUtil;
const config = require('../src/config.js');
const Control = require('../src/Control');

global._ = _;
global.BU = BU;

describe('Config Setter Test', () => {
  it('parsing Test', done => {
    const control = new Control(config);
    control.converter.setProtocolConverter(control.config.deviceInfo);
    // control.setDeviceClient(control.config.deviceInfo);

    control.init();

    expect(true).to.be.ok;

    done();
  });
});
