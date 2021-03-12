require('dotenv').config();

module.exports = {
  current: {
    dbInfo: {
      host: process.env.PJ_DB_HOST,
      user: process.env.PJ_DB_USER,
      port: process.env.PJ_DB_PORT,
      password: process.env.PJ_DB_PW,
      database: process.env.PJ_DB_DB,
    },
    controllerInfo: {
      main_seq: Number(process.env.PJ_MAIN_SEQ) || 1,
      target_id: 'wds_01',
      target_category: 'weatherDevice',
      data_table_name: 'weather_device_data',
      trouble_table_name: null,
    },
    inquiryIntervalSecond: 60,
  },
  smInfrared: {
    current: {
      hasDev: true, // 장치 연결을 실제로 하는지 여부
      deviceInfo: {
        target_id: 'SI1',
        target_name: 'SmRainSensor',
        target_category: 'weather',
        connect_info: {
          type: 'serial',
          subType: 'parser',
          baudRate: 9600,
          port: 'COM20',
          addConfigInfo: {
            parser: 'byteLengthParser',
            option: 55,
          },
        },
      },
    },
  },
  vantagepro2: {
    current: {
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
          hasReconnect: true,
        },
        connect_info: {
          type: process.env.VANTAGE_TYPE || 'serial',
          host: process.env.VANTAGE_HOST || 'localhost',
          port: process.env.VANTAGE_PORT,
          baudRate: 19200,
        },
      },
    },
  },
};
