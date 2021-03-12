const moment = require('moment');

const {
  CU: { AverageStorage },
  BU,
} = require('base-util-jh');

const { BaseModel } = require('sm-protocol-manager');

const {
  Weathercast: { BASE_MODEL },
} = BaseModel;

class Model {
  /**
   * 저장소를 깨끗이 비우고 현재 값을 초기화 시킴
   * @param {BASE_MODEL} baseModel
   */
  init(baseModel = BASE_MODEL) {
    this.deviceData = baseModel;

    const averConfig = {
      maxStorageNumber: 6, // 최대 저장 데이터 수
      keyList: Object.keys(this.deviceData),
      isCenterAvg: 1,
    };

    this.averageStorage = new AverageStorage(averConfig);

    this.averageStorage.init();
  }

  /**
   * @param {BASE_MODEL} weathercastData
   */
  onData(weathercastData) {
    // BU.CLI(weathercastData);
    // BU.CLI(
    //   'SolarRadiation',
    //   this.averageStorage.dataStorage[BaseModel.Weathercast.BASE_KEY.SolarRadiation],
    // );
    weathercastData = this.averageStorage.onData(weathercastData);

    this.deviceData = weathercastData;

    console.log('onVantagePro >>> ', moment().format('YY-MM-DD HH:mm:ss'));

    // console.dir(this.deviceData);
  }
}

module.exports = Model;
