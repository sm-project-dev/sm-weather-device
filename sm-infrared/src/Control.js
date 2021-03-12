const { BU } = require('base-util-jh');

const Model = require('./Model');

const mainConfig = require('./config');
const Serial = require('./DeviceClient/Serial');

require('sm-default-intelligence');

class Control {
  /** @param {mainConfig} config */
  constructor(config) {
    this.config = config.current || mainConfig.current;

    // BU.CLI(this.config);
    this.model = new Model(this);
  }

  /**
   * 개발 버젼일 경우 장치 연결 수립을 하지 않고 가상 데이터를 생성
   */
  async init() {
    if (!this.config.hasDev) {
      this.serialClient = new Serial(
        this.config.deviceInfo,
        this.config.deviceInfo.connect_info,
      );
      this.serialClient.attach(this);
      await this.serialClient.connect();
    } else {
      require('./dummy')(this);
    }
  }

  /**
   * 장치의 현재 데이터 및 에러 내역을 가져옴
   * @return {{id: string, config: Object, data: {smRain: number}, systemErrorList: Array, troubleList: Array}}
   */
  getDeviceOperationInfo() {
    return {
      id: this.config.deviceInfo.target_id,
      config: this.config.deviceInfo,
      data: this.model.deviceData,
      // systemErrorList: [{code: 'new Code22223', msg: '에러 테스트 메시지22', occur_date: new Date() }],
      systemErrorList: this.systemErrorList,
      troubleList: [],
    };
  }

  /**
   * Device Controller에서 새로운 이벤트가 발생되었을 경우 알림
   * @param {string} eventName 'dcConnect' 연결, 'dcClose' 닫힘, 'dcError' 에러
   */
  async onEvent(eventName) {}

  /**
   * 장치로부터 데이터 수신
   * @interface
   * @param {buffer} bufData 현재 장비에서 실행되고 있는 명령 객체
   */
  onData(bufData) {
    // BU.CLI(bufData);
    const resultData = this.model.onData(bufData);

    // BU.CLI(this.getDeviceOperationInfo().data);

    // // 현재 내리는 비가 변화가 생긴다면 이벤트 발생
    // if (!_.isEmpty(resultData)) {
    //   BU.CLI('이벤트 발생', resultData);
    //   this.emit('updateSmRainSensor', resultData);
    // }

    // BU.CLIN(this.getDeviceOperationInfo());
  }
}
module.exports = Control;
