const cron = require('cron');

const SmInfrared = require('../sm-infrared');
const Vantagepro2 = require('../vantagepro2');

const Model = require('./Model');

const mainConfig = require('./config');

class Control {
  /** @param {mainConfig} config */

  /**
   *
   * @param {mainConfig} config
   * @param {mainConfig} refineConfig
   */
  constructor(config, refineConfig) {
    this.config = config.current || mainConfig.current;

    this.model = new Model(this, refineConfig);

    this.smInfrared = new SmInfrared(config.smInfrared);
    this.vantagepro2 = new Vantagepro2(config.vantagepro2);

    this.cronScheduler = null;
  }

  /** 기상 장치 컨트롤러 객체를 초기화 하고 스케줄러를 호출. (장치 접속 및 프로그램 구동) */
  init() {
    // TODO: 적외선 센서 달면 활성화 할 것
    // this.smInfrared.init();
    this.vantagepro2.init();

    this.runScheduler();
  }

  /** VantagePro2와 SmInfraredSensor 데이터를 가져올 스케줄러 */
  runScheduler() {
    if (this.cronScheduler !== null) {
      // BU.CLI('Stop')
      this.cronScheduler.stop();
    }
    // 1분마다 요청
    this.cronScheduler = new cron.CronJob(
      process.env.PJ_CRON_FORMAT || '0 * * * * *',
      () => {
        this.model.getWeatherDeviceData(new Date());
      },
      null,
      true,
    );

    return true;
  }

  /**
   * 장치의 현재 데이터 및 에러 내역을 가져옴
   * @return {deviceOperationInfo}
   */
  getDeviceOperationInfo() {
    return {
      id: this.config.controllerInfo.target_id,
      config: this.config.controllerInfo,
      data: this.model.deviceData,
      systemErrorList: this.model.systemErrorList,
      troubleList: this.model.troubleList,
      measureDate: new Date(),
    };
  }
}
module.exports = Control;
