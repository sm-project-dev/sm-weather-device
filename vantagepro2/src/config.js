// /**
//  * @property {Object} config
//  * @property {Object} config.current
//  */

/** @type {deviceInfo} */
const deviceInfo = {
  target_id: 'VantagePro_1',
  target_name: 'Davis Vantage Pro2',
  target_category: 'weather',
  protocol_info: {
    mainCategory: 'Weathercast',
    subCategory: 'vantagepro2',
    protocolOptionInfo: {
      hasTrackingData: true,
    },
  },
  controlInfo: {
    hasErrorHandling: false,
    hasOneAndOne: true,
    hasReconnect: true,
  },
  // connect_info: {
  //   type: 'serial',
  //   baudRate: 19200,
  //   port: 'COM3',
  // },
  connect_info: {
    type: 'socket',
    subType: 'parser',
    addConfigInfo: {
      parser: 'readLineParser',
      // parser: 'delimiterParser',
      option: Buffer.from('4c4f4f', 'hex').toString(),
      // option: '\u0013\u0010',
    },
    host: '192.168.0.11',
    port: 22222,
  },
};

const config = {
  current: {
    hasDev: true, // 장치 연결을 실제로 하는지 여부
    // deviceInfo,
    deviceInfo: {
      target_id: 'VantagePro_1',
      target_name: 'Davis Vantage Pro2',
      target_category: 'weather',
      protocol_info: {
        mainCategory: 'Weathercast',
        subCategory: 'vantagepro2',
        protocolOptionInfo: {
          hasTrackingData: true,
        },
      },
      controlInfo: {
        hasErrorHandling: false,
        hasOneAndOne: true,
        hasReconnect: true,
      },
      // connect_info: {
      //   type: 'serial',
      //   baudRate: 19200,
      //   port: 'COM3',
      // },
      connect_info: {
        type: 'socket',
        host: '192.168.0.11',
        port: 22222,
      },
    },
  },
};
module.exports = config;
