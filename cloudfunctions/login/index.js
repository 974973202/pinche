// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = (event, context) => {
  console.warn(event, 'event')
  // userInfo: { 
  //   appId: 'wx64a9c58bb4ea4aae',
  //   openId: 'oETo345ZRCZQKAoNwTbCD7tMYBf4'
  // }
  
  console.warn(context, 'context')
  // { callbackWaitsForEmptyEventLoop: [Getter/Setter],
  //   done: [Function: done],
  //   succeed: [Function: succeed],
  //   fail: [Function: fail],
  //   getRemainingTimeInMillis: [Function: getRemainingTimeInMillis],
  //   memory_limit_in_mb: 256,
  //   time_limit_in_ms: 3000,
  //   request_id: '5fd9c7b1-6598-11ea-bcf1-52540074ea5e',
  //   environ: 'WX_CLIENTIP=10.12.23.71;WX_CLIENTIPV6=::ffff:10.12.23.71;WX_APPID=wx64a9c58bb4ea4aae;WX_OPENID=oETo345ZRCZQKAoNwTbCD7tMYBf4;WX_API_TOKEN=eyJFbmNyeXB0QWxnbyI6IkVOQ1JZUFRfQUxHT19BRVNfQ0dNIiwiVmVyc2lvbiI6MSwiS2V5VmVyc2lvbiI6OTMsImV2ZW50SWQiOiJISGtSQy1xazVSRXo5YWhDZzB1TlBON3V3dWc1M1dsbkFwbTlHSWNUa0M4T3NjNVlpZlU1UndZa2U1MUl4VWcycWxFWnIzZGxhT0FGOE81YzlSa29pcUcyeUZaSVo3N0dDR21YWmFPRW4wX3oiLCJ0aWNrZXQiOiJDRkVTZ0FRenpGdnAvdDd3QXNCTFVHbGtOa01hQ0R6cG8xWUs1VVhHR0pBV2hVKzQ2d0QzcnlQUmx3U0tpVjhjMG9XMDhBUnNISzdwM2ZNS3F2M1RnZVFMN3crelhCRGRzbXZjZStMZUtRNElTNGFiZmN2OVY4clE3UmhsK2dSM0JHN2RRSGlONVZGdjR6Z0lDdHdjSUppZDROQTNJRW1HWGdBVGIwNjZXUDQwOFlPT2RNR1hSZFFUL3dLK3VYZWxIV2k2R2Z2NjRieEhYM25EL3cyWUdBOWkveFEyemtUNlVwN2RFYkRYdVlMMmhJMUlBVUhoWU4zcUNqWUxMdTEyVk81YlQ5Ny8yWkU1MDEwOUJOZkYzbWJlTnFtVlczL1U1UzQvYTJDTFVDalNZZDFKb3RmVDhFT1RUcW80aTZyOXEvV3NpNm1EQ21ObXQrUHZGVXpQNEJQc3lBcHViUWVweW1qeGU0SlhLQkQ5NmRJelpoOUNmWGN6ZGtmaEVrUU1xZW9YS3lrN1poK3NQODBEK3ZxcEZ3UnhET3hCejErSmZ3RGVjalkyZnJhalpZYlR4ZUpzYUk3OXQrdkdFK2d5bzIrVGU3bGhORzRZUVlUeTQxWk5SRnhMOC9XZGdtVDhuMDF2dnpxbmxHcERJVS9pd2NKdkJHT2VCK21pY002QUJsYWx2ZStyUU8zTS9jbjkxM0tqcStpdTVuS1JrUElxWWlsa0x5NE9BL1UyWFoyU21rY2EwS3NkYzI4OFRuNklEZVQwNkREN09xL1gvaVphclZBcFZZYkxka1luNld2NGs1Vmh0YUVnTXlrT2VqbTVHRy9JZ2lWY2ZxRjhRTDlNUU4ycU9neXlVdDFvdWg1WjRkWnFwcEF0eFFkSXdGY3ZGeFhhajZGVjNmNEQ4MnR5UlNBQSJ9;WX_CONTEXT_KEYS=WX_CLIENTIP,WX_CLIENTIPV6,WX_APPID,WX_OPENID,WX_API_TOKEN;TCB_ENV=test-c555c3;TCB_SEQID=1584151527896_0.4144915102962319_33610331;TRIGGER_SRC=tcb;TCB_ISANONYMOUS_USER=false;TCB_SESSIONTOKEN=3K85KYu4jqRHDBRIaiy6jaitsvQA9xykf65a19a07e25746300e71ba0732335cdkXfojfhKvCqoWcLDPTrGCrifADFEI6ZcQ7yEp0ML6tadEqqshyCeEsF8f4yR24VvoYExs0kNh3jKkdCnSmu3LT3yj7v_Hd8tIE7OAxfySn4k9Xxoc4qeflmr56NrWt_mfHsgpdS-gxE1up0lqy7hJkt8mGSLrrd1Z0Wjr4P-7RjSJuDMPwi9j_82ct5Ax75MxF0Av2FzbKyz_e1eeFhRxR9f6FiLdar4h_dep2G4J7l0bOJry6MPOP4VFWDqk4WdKB1r4RwXfwIBLqaPSosI6_QoGFZKJmFCJATTgJyHJYwI-gnJvZ5KSnTB2R4MshK9llJ4m9NninWpWD7-NvQOBlvZWX54BB3wiHX_NaZJMf8;TCB_SOURCE=wx_devtools;TCB_CONTEXT_KEYS=TCB_ENV,TCB_SEQID,TRIGGER_SRC,TCB_ISANONYMOUS_USER,TCB_SESSIONTOKEN,TCB_SOURCE;TENCENTCLOUD_SECRETID=AKID_cd1VdHL-bN-XQmHATwDwZkMB7G-sWRNP9wxx1Wo-8ckzoas94iPmwV9_cJEgdJB;TENCENTCLOUD_SECRETKEY=MzvvZLerv4h9E6lf+UHIXuNu0VzSd2y+EdeTnWLgcGg=;TENCENTCLOUD_SESSIONTOKEN=pxPdhrfy7ZOLmdTPsrHlCP5CT75qf1YW18474b4e3bbfa9475e9c2480c7c05a07nrj9FoI4ssqXJkt35Wb2zCi_te1fiPDE9WCDoeA_2WuZhw1uauEF1zc0vmZJ6S68PG22SGFa_EhNZ4ulcbgXGVRDlHp4TjylEU902nHnhTUmURwoNuf-4W4JkHqTGpRWP5GOHb4uynVGQOLeu8OGlHuDsY6SP4ar72Qh7mjWGJXFJzvsvgNDUmWpuSbqLYkQrzHOkb2gVpIXRlFvfYpRrZlj8W-Yc3EZGmk11iXM8CeXYJbkKJxC2DruXVTHEtZLjRsLvZ2QKxVz39DXZUMlMAMSdNaPR3zx9sNz6glsFs8RHKsTiyYmLPcC9CMgFu_tUx0ZsWptOS_AewJKV6TQFVWWvcjo62fBwmaqJrUVjQA;SCF_NAMESPACE=test-c555c3',
  //   function_version: '$LATEST',
  //   function_name: 'login',
  //   namespace: 'test-c555c3' }

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）
  const wxContext = cloud.getWXContext()
  console.log(wxContext, 'wxContext')
  // { CLIENTIP: '10.12.23.71',
  // CLIENTIPV6: '::ffff:10.12.23.71',
  // APPID: 'wx64a9c58bb4ea4aae',
  // OPENID: 'oETo345ZRCZQKAoNwTbCD7tMYBf4',
  // ENV: 'test-c555c3',
  // SOURCE: 'wx_devtools' }

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}
