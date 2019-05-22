const fs = require('fs')
const request = require('request-promise-native')

const FpManager = function() {
  this.postCaptcha = async function (b64Code) {
	  let captchaIoId = ""
    const options = {
      url: 'https://api.captchas.io/in.php',
      method: "POST",
      form: {
        method: 'base64',
        key: "",
        body: b64Code
      }
    }

	  try {
	    let body = await request(options)

	    if (body.match(/OK\|.*/)) {
	      captchaIoId = body.replace(/OK\|(.*)/g, '$1').trim()
	    } else {
	      throw new Error("Response沒有回傳正確結果, 請檢察傳送參數是否正確")
	    }
	  } catch (err) {
	    throw new Error("傳送b64驗證碼時有誤", err)
	  }

	  return captchaIoId
  }

  this.getCaptcha = async function (captchaIoId) {
  	let resolvedCaptcha = await iteRequest()

  	return resolvedCaptcha

  	async function iteRequest(count) {
  		const limit = 5
	  	let resolvedCaptcha = ""

  		count = count ? count : 1

  		try {
  			resolvedCaptcha = await requestOnce()
  		} catch (err) {
  			console.log("有錯誤err:", err)

	  		if(count < limit) {
	  			count = count + 1
	  			await delay(1000)
	  			await iteRequest(count)
  			} else {
  				throw new Error("迭代嘗試取得captcha code依然失敗 err: ", err)
  			}
  		}

			return resolvedCaptcha
  	}

    async function requestOnce() {
	  	let resolvedCaptcha = ""
	    const options = {
	      url: 'https://api.captchas.io/res.php',
	      method: "GET",
	      qs: {
	        key: "",
	        action: 'get',
	        json: 1,
	        id: captchaIoId
	      },
				transform: function(body) {
					return JSON.parse(body)
				}
	    }

    	const body = await request(options)

	    if(body && body.status == 1 && body.request) {
	      resolvedCaptcha = body.request
	    } else {
	      throw new Error("Response沒有回傳正確結果, 請檢察傳送參數是否正確")
	    }

	    return resolvedCaptcha
    }
  }

  const delay = function(s) {
	  return new Promise(function(resolve,reject){
	   setTimeout(resolve,s)
	  })
	}
}

module.exports = function() {
  return new FpManager()
};