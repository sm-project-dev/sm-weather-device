const _ = require('lodash');
const { BU } = require('base-util-jh');
const Control = require('./Control');

const strData = '0000000000000000000000000000000000000000000000030000000';
const dummyList = [strData];

dummyList.forEach((currentItem, index) => {
  dummyList[index] = Buffer.from(currentItem);
});

const index = 0;

let onceRun = true;
/**
 * @param {Control} controller
 */
const generateData = controller => {
  if (onceRun) {
    onceRun = false;
    BU.CLI('데이터 생성기 시작');
    setInterval(() => {
      let rData = _.random(0, 200).toString();
      for (let i = rData.length; i < 3; i++) {
        rData = `0${rData}`;
      }

      const strData = `0000000000000000000000000000000000000000000000${rData}000000`;
      controller.onDcData({
        commandSet: { cmdList: [{ data: '', commandExecutionTimeoutMs: 1000 }] },
        currCmdIndex: 0,
        data: strData,
      });
    }, 2000);
  }
};

/**
 * @param {Control} controller
 */
module.exports = controller => generateData(controller);
