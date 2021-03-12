const _ = require('lodash');
const moment = require('moment');

const { BU, CU } = require('base-util-jh');
const AbstDeviceClientModel = require('device-client-model-jh');
const Control = require('./Control');

class Model extends AbstDeviceClientModel {
  /**
   *
   * @param {Control} controller
   * @param {Object} refineConfig
   */
  constructor(controller, refineConfig) {
    super(refineConfig);
    this.controller = controller;
    this.dataStroageConfig = this.controller.config.controllerInfo;
    this.deviceCategory = this.dataStroageConfig.target_category;

    this.systemErrorList = [];
    this.troubleList = [];

    this.inquiryAllDeviceStatusTimer = null;

    this.init();
  }

  init() {
    // super.hasSaveToDB = true;
    this.setDevice(this.dataStroageConfig, {
      idKey: 'target_id',
      deviceCategoryKey: 'target_category',
    });

    BU.CLI(this.controller.config.dbInfo);
    this.setDbConnector(this.controller.config.dbInfo);
  }

  /**
   * 하부 기상 관측 장비 데이터 처리
   * @param {Date} measureDate
   */
  async getWeatherDeviceData(measureDate) {
    // BU.CLI('getWeatherDeviceData');

    // FIXME: cron 스케줄러가 중복 실행되는 버그가 해결되기 전까지 사용
    if (
      _.isNil(this.inquiryAllDeviceStatusTimer) ||
      !this.inquiryAllDeviceStatusTimer.getStateRunning()
    ) {
      this.inquiryAllDeviceStatusTimer = new CU.Timer(() => {
        this.inquiryAllDeviceStatusTimer.pause();
      }, _.subtract(_.multiply(1000, this.controller.config.inquiryIntervalSecond), 100));
    } else {
      // Timer가 존재하다면 추가 조회는 하지 않음.
      return false;
    }

    // // 시간에 문제가 있다면 삽입하지 않음
    // if (measureDate.getSeconds() !== 0) {
    //   BU.errorLog('vantage', BU.convertDateToText(measureDate));
    // }

    const smInfraredData = this.controller.smInfrared.getDeviceOperationInfo();
    const vantagepro2Data = this.controller.vantagepro2.getDeviceOperationInfo();

    // if (
    //   _(vantagepro2Data.data)
    //     .values()
    //     .value()
    //     .every(_.isNil())
    // ) {
    //   BU.logFile(vantagepro2Data.data);
    // }

    // BU.errorLog('vantage', JSON.stringify(vantagepro2Data.data));

    // 데이터를 추출한 후 평균 값 리스트 초기화
    this.controller.vantagepro2.model.init();

    this.systemErrorList = _.unionBy(
      smInfraredData.systemErrorList,
      vantagepro2Data.systemErrorList,
      'code',
    );
    this.troubleList = _.unionBy(
      smInfraredData.troubleList,
      vantagepro2Data.troubleList,
      'code',
    );

    // SM 적외선 데이터와 VantagePro2 객체 데이터를 합침
    this.deviceData = Object.assign(smInfraredData.data, vantagepro2Data.data);

    // BU.CLI(vantagepro2Data.data);
    /* 모든 데이터가 null이나 undefined라면 아직 준비가 안된것으로 판단 */
    if (_(this.deviceData).values().value().every(_.isNil)) {
      BU.log('장치의 데이터 수집이 준비가 안되었습니다.');
      // BU.logFile('장치의 데이터 수집이 준비가 안되었습니다.');
      return false;
    }

    const returnValue = this.onDeviceOperationInfo(
      this.controller.getDeviceOperationInfo(),
      this.deviceCategory,
    );

    console.log('insert DB >>> ', moment().format('YY-MM-DD HH:mm:ss'));
    console.dir(vantagepro2Data.data);

    // BU.CLIN(returnValue, 3);

    // DB에 입력
    const convertDataInfo = await this.refineTheDataToSaveDB(
      this.deviceCategory,
      measureDate,
      true,
    );
    // BU.CLI(convertDataInfo);

    const resultSaveToDB = await this.saveDataToDB(this.deviceCategory);
    // BU.CLI(resultSaveToDB);
  }
}

module.exports = Model;
