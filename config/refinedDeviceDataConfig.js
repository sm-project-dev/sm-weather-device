/**
 * @typedef {Object} tableParamFormat
 * @property {string} fromKey
 * @property {string} toKey
 */

module.exports = [
  {
    deviceCategory: 'weatherDevice',
    dataTableInfo: {
      tableName: 'weather_device_data',
      /** @type {Array.<tableParamFormat>} */
      addParamList: [
        {
          fromKey: 'main_seq',
          toKey: 'main_seq',
        },
      ],
      insertDateKey: 'writedate',
      matchingList: [
        {
          fromKey: 'inclinedSolar',
          toKey: 'inclined_solar',
          calculate: 1,
          toFixed: 1,
        },
        {
          fromKey: 'smInfrared',
          toKey: 'sm_infrared',
          calculate: 1,
          toFixed: 1,
        },
        {
          fromKey: 'OutsideTemperature',
          toKey: 'temp',
          calculate: 1,
          toFixed: 1,
        },
        {
          fromKey: 'OutsideHumidity',
          toKey: 'reh',
          calculate: 1,
          toFixed: 0,
        },
        {
          fromKey: 'WindDirection',
          toKey: 'wd',
          calculate: 1,
          toFixed: 0,
        },
        {
          fromKey: 'Min10AvgWindSpeed',
          toKey: 'ws',
          calculate: 1,
          toFixed: 1,
        },
        {
          fromKey: 'RainRate',
          toKey: 'rain_h',
          calculate: 1,
          toFixed: 1,
        },
        {
          fromKey: 'DayRain',
          toKey: 'rain_d',
          calculate: 1,
          toFixed: 1,
        },
        {
          fromKey: 'SolarRadiation',
          toKey: 'solar',
          calculate: 1,
          toFixed: 0,
        },
        {
          fromKey: 'UV',
          toKey: 'uv',
          calculate: 1,
          toFixed: 0,
        },
      ],
    },
  },
];
