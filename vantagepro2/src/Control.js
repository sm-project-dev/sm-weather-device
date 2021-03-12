const _ = require('lodash');
const path = require('path');
const eventToPromise = require('event-to-promise');
const EventEmitter = require('events');

const { BU } = require('base-util-jh');

const AbstController = require('sm-communication-manager');
const { dccFlagModel } = require('sm-default-intelligence');

const {
  AbstConverter,
  BaseModel: { Weathercast },
} = require('sm-protocol-manager');

const Model = require('./Model');

const mainConfig = require('./config');

class Control extends EventEmitter {
  /** @param {mainConfig} config */
  constructor(config = mainConfig) {
    super();

    const {
      current: {
        deviceInfo,
        deviceInfo: { protocol_info: protocolInfo },
      },
    } = config;

    this.config = config.current;

    this.deviceInfo = deviceInfo;

    this.converter = new AbstConverter(protocolInfo);
    this.converter.setProtocolConverter();

    this.baseModel = new Weathercast(protocolInfo);

    this.setInterval = null;
    this.hasReceivedData = false;
    this.errorCount = 0;
  }

  get id() {
    return this.config.deviceInfo.target_id;
  }

  /**
   * 개발 버젼일 경우 장치 연결 수립을 하지 않고 가상 데이터를 생성
   */
  async init() {
    // 라이브러리 로딩까지 초기 구동 시간을 부여
    // 모델 선언
    this.model = new Model(this);

    await this.model.init(Weathercast.BASE_MODEL);

    try {
      const abstController = new AbstController();
      this.definedControlEvent = abstController.definedControlEvent;
      const { CONNECT, DISCONNECT } = this.definedControlEvent;

      this.deviceController = abstController.setDeviceController(this.deviceInfo);
      this.deviceController.attach(this);

      // BU.CLI(this.deviceInfo);

      // 이미 접속 중인 객체가 있다면
      if (!_.isEmpty(this.deviceController.client)) {
        return this;
      }

      // 장치 접속 관리자에게 접속 요청
      this.deviceController.doConnect();

      // Connect 결과 이벤트가 발생할때까지 대기
      await eventToPromise.multi(this, [CONNECT], [DISCONNECT]);

      return this;
    } catch (error) {
      BU.error(error);
      // 초기화에 실패할 경우에는 에러 처리
      if (error instanceof ReferenceError) {
        throw error;
      }
      // Controller 반환
      return this;
    }
  }

  /**
   * Device Controller에서 새로운 이벤트가 발생되었을 경우 알림
   * @param {string} eventName 'dcConnect' 연결, 'dcClose' 닫힘, 'dcError' 에러
   */
  async onEvent(eventName) {
    BU.log('Vantage Pro', eventName);
    const { CONNECT, DISCONNECT } = this.definedControlEvent;

    switch (eventName) {
      case CONNECT:
        this.emit(CONNECT);

        await this.deviceController.write(this.baseModel.device.DEFAULT.COMMAND.WAKEUP);

        // 데이터 수신 체크 크론 동작
        this.runDeviceInquiryScheduler();
        break;
      case DISCONNECT:
        this.emit(DISCONNECT);
        // this.deviceController.connect();
        break;
      default:
        break;
    }
  }

  /**
   * 장치에서 데이터가 수신되었을 경우 해당 장치의 데이터를 수신할 Commander에게 전송
   * @param {*} bufData
   */
  onData(bufData) {
    // BU.log('onData');
    const {
      definedCommanderResponse: { DONE, WAIT },
    } = dccFlagModel;

    const logPath = path.join(
      process.cwd(),
      'log',
      `${BU.convertDateToText(new Date(), '', 2)}.log`,
    );

    BU.appendFile(logPath, `onVantagePro: ${Buffer.from(bufData).toString('hex')}`);

    const { data, eventCode } = this.converter.parsingUpdateData({ data: bufData });

    // 데이터가 완성 안되었을 경우 대기
    if (eventCode === WAIT) {
      return;
    }

    if (eventCode === DONE) {
      // 정상적인 데이터가 들어왔다고 처리
      this.hasReceivedData = true;
      this.model.onData(data);
    } else {
      // BU.CLI(resultParsing)
    }
  }

  // Cron 구동시킬 시간
  runDeviceInquiryScheduler() {
    if (this.setInterval !== null) {
      // BU.CLI('Stop')
      clearInterval(this.setInterval);
    }
    // 3초마다 데이터 수신 확인 (LOOP 명령은 2초 마다 전송하기 때문에 충분)
    this.setInterval = setInterval(() => {
      this.inquiryDevice();
    }, 3000);

    this.inquiryDevice();

    return true;
  }

  updatedDcEventOnDevice(dcEvent) {
    super.updatedDcEventOnDevice(dcEvent);
  }

  /**
   * 데이터 탐색
   */
  async inquiryDevice() {
    // BU.CLI(this.errorCount);
    // 정상적인 데이터가 들어왔을 경우
    if (this.hasReceivedData) {
      // 초기화
      this.errorCount = 0;
      this.hasReceivedData = false;
    } else {
      this.errorCount += 1;

      if (_.isEmpty(this.deviceController.client)) {
        await this.deviceController.doConnect();
        BU.CLI('Vantage Pro errCount', this.errorCount);
        return false;
      }

      // 데이터가 2번 이상 들어오지 않는다면 문제가 있다고 판단
      if (this.errorCount === 2) {
        BU.CLI('vantagePro: ECOUNT:2, LOOP 요청');
        await this.deviceController.write(this.baseModel.device.DEFAULT.COMMAND.LOOP);
        // BU.CLI('vantagePro: ECOUNT:2, LOOP 완료');
      } else if (this.errorCount === 4) {
        // 그래도 정상적인 데이터가 들어오지 않는다면
        BU.CLI('vantagePro: ECOUNT:4, LOOP_INDEX 요청');
        await this.deviceController.write(
          this.baseModel.device.DEFAULT.COMMAND.LOOP_INDEX,
        );
        // BU.CLI('vantagePro: ECOUNT:4, LOOP_INDEX 완료');
      } else if (this.errorCount === 6) {
        // 통제할 수 없는 에러라면
        this.errorCount = 0; // 새롭게 시작
        BU.CLI('vantagePro: ECOUNT:6, disconnect 요청');
        // trackingDataBuffer 삭제
        this.converter.resetTrackingDataBuffer();
        await this.deviceController.disconnect(); // 장치 재접속 요청

        BU.CLI('Vantage Pro', 'disconnect');
      } else {
        return false;
      }
    }
  }

  /**
   * 장치의 현재 데이터 및 에러 내역을 가져옴
   */
  getDeviceOperationInfo() {
    return {
      id: this.deviceInfo.target_id,
      config: this.deviceInfo,
      data: this.model.deviceData,
      // systemErrorList: [{code: 'new Code2222', msg: '에러 테스트 메시지22', occur_date: new Date() }],
      systemErrorList: [],
      troubleList: [],
      measureDate: new Date(),
    };
  }
}
module.exports = Control;
