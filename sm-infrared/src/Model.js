const _ = require('lodash');

const {BU, CU} = require('base-util-jh');

class Model {
  constructor() {
    this.deviceData = {
      smInfrared: null,
    };

    const averConfig = {
      maxStorageNumber: 10, // 최대 저장 데이터 수
      keyList: Object.keys(this.deviceData),
    };

    this.averageStorage = new CU.AverageStorage(averConfig);
  }

  /**
   *
   * @param {Buffer} data
   */
  onData(data) {
    const dataLength = data.length;
    const usefulLength = 55;

    if (dataLength !== usefulLength) {
      throw new Error('정상적인 데이터가 아닙니다.');
    }

    const rainDataLength = 8;
    const endCharLength = 6;

    const rainBufferData = data.slice(
      dataLength - endCharLength - rainDataLength,
      dataLength - endCharLength,
    );
    const rainData = parseInt(rainBufferData, 16);
    this.averageStorage.addData('smInfrared', rainData);
    this.deviceData.smInfrared = this.averageStorage.getAverage('smInfrared');
    BU.CLI('smInfrared', this.deviceData.smInfrared);
  }

  /**
   * 현재 레인 센서 값에따라 비오는 여부 체크
   * @return {{rainLevel: number, status: string, keyword: string,  predictAmount: number, msg: string, averageRain: number}}
   */
  checkRain() {
    // BU.CLI('this.averageRain', this.averageRain);
    let foundIndex = 0;
    // 현재 기상 값의 범위에 들어있는 조건 탐색
    _.find(this.rainAlarmBoundaryList, (currItem, index) => {
      // 찾은 조건식 상 다음 Index가 실제 데이터이므로 1 증가
      if (currItem.boundary < this.averageRain) {
        foundIndex = index + 1;
        return true;
      }
    });

    const foundRainAlarm = this.rainAlarmBoundaryList[foundIndex];

    // 날씨가 더 나빠질 경우 알람 필요
    if (foundRainAlarm.rainLevel > this.lastestRainLevel) {
      const currTime = BU.convertDateToText(new Date(), 'kor', 4, 1);
      this.lastestRainLevel = foundRainAlarm.rainLevel;
      this.rainStatus = Object.assign({}, foundRainAlarm);
      this.rainStatus.averageRain = this.averageRain;
      this.rainStatus.msg = `${currTime}부터 ${foundRainAlarm.msg}`;

      return true;
    }
    if (foundRainAlarm.rainLevel === 0) {
      this.lastestRainLevel = 0;
    }
    return false;
  }
}

module.exports = Model;
