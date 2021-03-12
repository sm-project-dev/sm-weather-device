const _ = require('lodash');
const Serialport = require('serialport');
const eventToPromise = require('event-to-promise');

const AbstController = require('./AbstController');

/** @type {Array.<{id: string, instance: SerialWithParser}>} */
const instanceList = [];
class SerialWithParser extends AbstController {
  /**
   * Serial Port 객체를 생성하기 위한 설정 정보
   * @param {deviceInfo} mainConfig
   * @param {constructorSerialWithParser} connectInfo {port, baud_rate, raget_name}
   */
  constructor(mainConfig, connectInfo) {
    super(mainConfig);
    this.port = connectInfo.port;
    this.baud_rate = connectInfo.baudRate;
    this.parserInfo = connectInfo.addConfigInfo;

    const foundInstance = _.find(instanceList, { id: this.port });
    if (_.isEmpty(foundInstance)) {
      this.configInfo = { port: this.port, baud_rate: this.baud_rate, parser: this.parserInfo };
      instanceList.push({ id: this.port, instance: this });
      this.setInit();
    } else {
      return foundInstance.instance;
    }
  }

  /**
   * Parser Pipe 를 붙임
   * @param {Object} client SerialPort Client
   */
  settingParser(client) {
    let parser = null;
    if (this.parserInfo !== undefined && this.parserInfo.parser !== undefined) {
      switch (this.parserInfo.parser) {
        case 'delimiterParser':
          parser = client.pipe(
            new Serialport.parsers.Delimiter({
              delimiter: this.parserInfo.option,
            }),
          );
          parser.on('data', data => {
            this.notifyData(Buffer.concat([data, this.parserInfo.option]));
          });
          break;
        case 'byteLengthParser':
          parser = client.pipe(
            new Serialport.parsers.ByteLength({
              length: this.parserInfo.option,
            }),
          );
          parser.on('data', data => {
            this.notifyData(data);
          });
          break;
        case 'readLineParser':
          parser = client.pipe(
            new Serialport.parsers.Readline({
              delimiter: this.parserInfo.option,
            }),
          );
          parser.on('data', data => {
            this.notifyData(Buffer.from(data));
          });
          break;
        case 'readyParser':
          parser = client.pipe(
            new Serialport.parsers.Ready({
              delimiter: this.parserInfo.option,
            }),
          );
          parser.on('data', data => {
            this.notifyData(data);
          });
          break;
        default:
          break;
      }
    }
  }

  /**
   * Serial Device로 메시지 전송
   * @param {Buffer|string} 전송 데이터
   * @return {Promise} Promise 반환 객체
   */
  write(msg) {
    return new Promise((resolve, reject) => {
      this.client.write(msg, err => {
        reject(err);
      });
      resolve();
    });
  }

  async connect() {
    // BU.CLI('connect');
    /** 접속 중인 상태라면 접속 시도하지 않음 */
    if (!_.isEmpty(this.client)) {
      throw new Error(`Already connected. ${this.port}`);
    }
    const client = new Serialport(this.port, {
      baudRate: this.baud_rate,
    });

    this.settingParser(client);

    client.on('close', err => {
      this.client = {};
      this.notifyDisconnect(err);
    });

    client.on('error', error => {
      this.notifyError(error);
    });

    await eventToPromise.multi(client, ['open'], ['error', 'close']);
    this.client = client;
    return this.client;
  }

  /**
   * Close Connect
   */
  async disconnect() {
    if (!_.isEmpty(this.client)) {
      this.client.close();
      await eventToPromise.multi(this.client, ['close'], ['error', 'disconnectError']);
      return this.client;
    }
    return this.client;
  }
}
module.exports = SerialWithParser;
