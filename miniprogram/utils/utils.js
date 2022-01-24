// const baseConfig = require('../config/baseConfig');
// const mpConfig = require('../mpConfig');
// const {
//   prefixJsonUrl
// } = require('../config/devConfig');
// const md5 = require('../lib/md5');
// const formIdToken = 'gZfKOYaO39ecBFpy';


function compareVersion(num1, num2) {
  let arr1 = num1.split('.');
  let arr2 = num2.split('.');
  for (let i = 0; i < arr1.length; i++) {
    let num1 = Number(arr1[i]);
    let num2 = Number(arr2[i]);
    if (num1 > num2) {
      return true;
    } else if (num1 < num2) {
      return false;
    }
  }
  return false;
}

/**
 * 获取FormIdRequest的sign
 * @param dataArr 请求中的data所有参数
 */
// function getFormIdSign(dataArr) {
//   let str = assemble(dataArr);
//   return (md5((((md5(str).toString().toUpperCase())) + formIdToken)).toString()).toUpperCase();
// }

/**
 * 判断时间是否是当天
 */
function isToday(date) { //判断时间是否是当天
  return new Date().toDateString() === new Date(date).toDateString();
}

/**
 * 判断时间是否是昨天
 */
function isYesterday(date) { //判断时间是否是当天
  let yesterday = new Date().getTime() - 24*60*60*1000;
  return new Date(yesterday).toDateString() === new Date(date).toDateString();
}

function getRandom(length){
  return Math.round(Math.random() * length) 
}

function getAdListByName(name, ads) {
  name = name || 'index'
  let adList = []
  for (let key in ads) {
    if (key.indexOf(name) > -1) {
      adList.push(ads[key])
    }
  }
  // 排序
  adList.sort(function (a, b) {
    let value1 = a.id.substring(name.length)
    let value2 = b.id.substring(name.length)
    return parseInt(value1) - parseInt(value2)
  })
  return adList
}

/**
 * 弹窗提示
 * @param{String} text 提示内容
 * @param{String} pageUrl 提交确定后跳转的页面
 */
const dialogCom = (text, pageUrl) => {
  wx.showModal({
    title: '提示',
    content: text,
    showCancel: !1,
    success(res) {
      if (res.confirm) {
        // console.log('用户点击确定')
        wx.reLaunch({
          url: pageUrl
        })
      }
    }
  })
}

/**
 * 获取用户状态
 * (ture:黑名单，false:白名单)
 * @param{String} articleId 文章id
 */
// const getUserStatus = async (articleId) => {
//   let useVipFunction = baseConfig.useVipFunction
//   if (!useVipFunction) {
//     return false
//   }
//   console.warn('检验vip体验的文章id', articleId, articleId < 100000000)
//   let status = await wx.store.get('userStatus');
//   if (articleId) {
//     return !status && articleId < 100000000
//   } else {
//     return !status
//   }
// }


/**
 * 处理数据，把data对应的title加上对应的问候语
 * @param{Array或Object} data 要处理的数据
 * @param{string} key data对应要更换title的字段
 * @param{string} titlePrefixType 类型
 */
const addGreetings = async (data, key = 'title') => {
  if (Array.isArray(data)) { //数组
    for(let item of data){
      if(item.title_prefix_type && item.title_prefix_type != 0) {
        !item.title_original && (item.title_original = item.title) //确保title_original只更新一次
        item[key] = await getGreetings(item.title_prefix_type, item, key)
      }
    }
  } else { //对象
    data.title_prefix_type && data.title_prefix_type != 0 && (data[key] = await getGreetings(data.title_prefix_type, data, key))
  }
  return data
}

/**
 * 获取对应类型的问候语
 * @param{String} titlePrefixType 类型(0:无 1:问候关键字 2:星期关键字 3:日期关键字 4:地理前缀关键字 5:地理后缀关键字)
 */
const getGreetings = async (titlePrefixType, item, key) => {
  let title = item[key];
  if(key == 'title') { 
    // 有原标题（未添加任何问候语）先使用原标题处理
    title = item.title_original ? item.title_original: title
  }
  switch (Number(titlePrefixType)) {
    case 1:
      return getGreetingsKeyword() + title
    case 2:
      return getWeekKeyword() + title
    case 3:
      return getDateKeyword() + title
    case 4:
    case 5:
      return await getLocationKeyWord(titlePrefixType,title)
    default:
      return title
  }
}

const getLocationKeyWord = async (titlePrefixType,title) =>{
  const currentCity = await wx.store.get('currentCity')
  if(currentCity && titlePrefixType == 4){
    return `${currentCity}人注意！${title}`
  }else if(currentCity && titlePrefixType == 5){
    return `${title}${currentCity}人都看看！` 
  }else{
    return title
  }
  
}
const getGreetingsKeyword = () => {
  const hour = new Date().getHours()
  let str = ''
  if (hour >= 0 && hour < 8) {
    str = '早上'
  } else if (hour >= 8 && hour < 12) {
    str = '上午'
  } else if (hour >= 12 && hour < 14) {
    str = '中午'
  } else if (hour >= 14 && hour < 18) {
    str = '下午'
  } else if (hour >= 18 && hour <= 23) {
    str = '晚上'
  }
  return `${str}好，`
}

const getWeekKeyword = () => {
  const week = new Date().getDay()
  // console.log('week', week, typeof (week))
  let str = ''
  switch (week) {
    case 0:
      str = '日'
      break;
    case 1:
      str = '一'
      break;
    case 2:
      str = '二'
      break;
    case 3:
      str = '三'
      break;
    case 4:
      str = '四'
      break;
    case 5:
      str = '五'
      break;
    case 6:
      str = '六'
      break;
    default:
      break;
  }
  return `周${str}快乐`
}


const getDateKeyword = () => {
  const month = new Date().getMonth() + 1
  const date = new Date().getDate()
  return `今天是${month}月${date}号，`
}


/**
 * 时间戳 转化为 年月日 格式
 * @param {} inputTime 
 */
const tsFormatTime = inputTime => {
  let date;
  if(inputTime) {
    // var time = parseInt(inputTime) * 1000;
    // date = new Date(time);
    date = inputTime
  } else {
    date = new Date();
  }
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var str = y + '-' + m + '-' + d;
  return str;
}

/**
 * 时间戳 转化为 月日时分 格式 01/28 09:06
 * @param {} inputTime 
 */
const timestampToTime = inputTime => {
  let time = parseInt(inputTime) * 1000;
  let date = new Date(time);
  let M = date.getMonth() + 1;
  M = M < 10 ? ('0' + M) : M;
  let d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  let h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  let m = date.getMinutes();
  m = m < 10 ? ('0' + m) : m;
  let str = M + '/' + d + ' ' + h + ':' + m;
  return str;
}

/**
 * 时间戳 转化为 月日时分 格式 01/28 09:06
 * @param {} inputTime 
 */
 const exactTime = inputTime => {
  let date;
  if(inputTime) {
    var time = parseInt(inputTime) * 1000;
    date = new Date(time);
  } else {
    date = new Date();
  }
  let h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  let m = date.getMinutes();
  m = m < 10 ? ('0' + m) : m;
  let str = h + ':' + m;
  return str;
}

/**
 * 获取第三方自定义配置
 *@param{String} data 自定义字段
 */
// function getExtConfig(data) {
//   let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
//   if (!extConfig || JSON.stringify(extConfig) == "{}") { //mp提审
//     extConfig = mpConfig
//   }
//   let value = data ? extConfig.custom_config[data] : extConfig.custom_config;
//   // console.log('getExtConfig', data, value)
//   return value
// }

 /**
 * 获取 当前的年月日
 */
const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

/**
 * 获取 早上、下午、晚上 时间端段
 */
const getCurrentPeriod = () => {
  const date = new Date();
  const hours = date.getHours();
  if (hours >= 0 && hours < 8) {
    return '早上';
  } else if (hours >= 8 && hours < 12) {
    return '上午';
  } else if (hours >= 12 && hours < 14) {
    return '中午';
  } else if (hours >= 14 && hours < 18) {
    return '下午';
  } else {
    return '晚上';
  }
}

/**
 * 获取当前星期
 */
const getCurrentWeek = (time) => {
  const date = time ? new Date(time) : new Date();
  const weekday = [
    '星期日',
    '星期一',
    '星期二',
    '星期三',
    '星期四',
    '星期五',
    '星期六'
  ];
  const day = date.getDay();
  return weekday[day];
}


/**
 * 创建插屏广告
 */
// function createInterstitialAd(type) {
//   // console.log('useInterstitialAd', baseConfig.useInterstitialAd)
//   if (baseConfig.useInterstitialAd) {
//     if (wx.createInterstitialAd) {
//       console.log('开始创建广告', type)
//       let adUnitId;
//       if (type == 1) {
//         adUnitId = 'adunit-a86b0a9c05632596'
//       } else {
//         adUnitId = 'adunit-fc3697e46b1850b2'
//       }
//       let intersitialAd = wx.createInterstitialAd({
//         adUnitId: adUnitId
//       });
//       intersitialAd.show().catch(err => console.error('adERR', err));
//     } else {
//       console.warn('不支持wx.createInterstitialAd')
//     }
//   }
// }

/**
 * 随机数
 * @param min  最小范围
 * @param max  最大范围
 * @param num  小数的位数，不填默认整数
 */
function getRandomNumber(min, max, num) {
  let random =  (min + Math.round(Math.random() * (max - min)));
  let randomNumber = num ? random.toFixed(num) : random
  return randomNumber
}

/**
 * 获取当前页面路径
 */
function getNowRoute (){
  let pageList = getCurrentPages()
  return pageList[pageList.length - 1].route;
}

/**
 * 判断两天是否是同一天
 */
function onTheSameDay(date, date2) {
  return new Date(date).toDateString() === new Date(date2).toDateString();
}

/**
 * 非立即执行版
 * @param {Function} func 传入执行函数
 * @param {Number} wait 等待执行时间
 */
let debounceTimer;
function _debounce(func, wait) {
  let args = arguments;
  if(!func) return ;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    func.call(args)
  }, wait);
}

function pad2(n) {
  return n < 10 ? "0" + n : n;
}

function generateTimeReqestNumber() {
  var date = new Date();
  return (
    date.getFullYear().toString() +
    pad2(date.getMonth() + 1) +
    pad2(date.getDate()) +
    pad2(date.getHours()) +
    pad2(date.getMinutes()) +
    pad2(date.getSeconds())
  );
}


exports.compareVersion = compareVersion;
exports.isToday = isToday;
exports.getAdListByName = getAdListByName;
exports.dialogCom = dialogCom;
exports.addGreetings = addGreetings;
// exports.reportFormId = reportFormId;
// exports.checkShareType = checkShareType;
// exports.navigateToMiniProgram = navigateToMiniProgram;
// exports.canRewardNavigate = canRewardNavigate;
exports.tsFormatTime = tsFormatTime;
exports.timestampToTime = timestampToTime;
// exports.getExtConfig = getExtConfig;
exports.getCurrentDate = getCurrentDate;
exports.getCurrentPeriod = getCurrentPeriod;
exports.getCurrentWeek = getCurrentWeek;
// exports.createInterstitialAd = createInterstitialAd;
exports.getRandomNumber = getRandomNumber;
exports.getNowRoute = getNowRoute;
exports.getRandom = getRandom;
exports.onTheSameDay = onTheSameDay;
exports.isYesterday = isYesterday;
exports._debounce = _debounce;
exports.generateTimeReqestNumber = generateTimeReqestNumber;
exports.exactTime = exactTime
