const puppeteer = require('puppeteer')
const readline = require('readline')
const moment = require('moment')
const cmd = require('node-cmd')
const fs = require('fs')
const request = require('request-promise-native')
const FpManager = require("./lib/fp")()

askStartAndEnd()

async function askStartAndEnd() {
  const start = await askQuestion("從幾號開始?")
  const end = await askQuestion("到幾號結束?")
  console.log(start, "-", end)

  try {
    findRNumOfFp(start, end)
  } catch (err) {
    console.log(err)
  }
  //findRNumOfFp(start, end)
}

async function findRNumOfFp(start, end) {
  console.log(start, "到",end)
  start = parseInt(start)
  end = parseInt(end)
   console.log(start, "到",end)
  for (let i=start;i<=end;i++) {
    let rNum = pad(i, 4)

    console.log(rNum)

    try {
      let rNumIsTrue = await tryFapiau(rNum)

      if(rNumIsTrue) {
        console.log("正確的發票隨機碼是: ", rNum)

        break
      } else {
        console.log("隨機碼不是: ", rNum)
        //break
      }
    } catch (err) {
      console.log("重試:", rNum, err)

      let message = "重試 隨機碼: " + rNum
      let toExCmd = 'echo "' + message + '" >> result-log'
      //console.log(toExCmd)
      cmd.run(toExCmd)
    }
  }
}

async function tryFapiau(rNumber) {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
  const page = await browser.newPage()

  // 對話框處理
  page.on('dialog', async dialog => {
    console.log("對話框顯示: " + dialog.message());

    // 關了之後才會繼續執行接下來動作
    await dialog.dismiss();
    //await browser.close();
  });

  await page.goto('https://www.einvoice.nat.gov.tw/APMEMBERVAN/PublicAudit/PublicAudit');
  //await page.type('#username', 'username');
  await page.type("input[name='publicAuditVO.invoiceNumber']", 'QH35068107')

  // 日期用固定座標的方式去點
  //await page.type("input[name='publicAuditVO.invoiceDate']", '108/05/04')

  const date = "108/05/13"
  //const date = "108/04/03"
  //const customerIdentifier = "test"

  await page.evaluate((date) => {
  	// 傳給page.evaluate的callback, 所以document有東西
    document.querySelector("input[name='publicAuditVO.invoiceDate']").value = date;
  }, date);

  //await page.type("input[name='publicAuditVO.customerIdentifier']", customerIdentifier)
  await page.type("input[name='publicAuditVO.randomNumber']", rNumber)

  // let noww = moment().format("HH-mm-ss")
  // let imgPathw = noww + rNumber + '-碼.png'
  // console.log("照相")
  // await page.screenshot({path: imgPathw});
  // console.log("已產生圖檔: ", imgPathw)

  // 點擊驗證碼圖片
  //await page.click('#imageCode')

  // 顯示驗證碼圖片的html
  // const html = await page.$eval('#imageCode', e => e.outerHTML);
  // console.log(html)

	let now = moment().format("HH-mm-ss")
	let imgPath = now + rNumber + '-驗證碼.png'
	console.log("照相")
  let img = await page.$("#imageCode")
  await img.screenshot({path: imgPath});
	console.log("已產生驗證碼圖檔: ", imgPath)

  const b64Code = base64_encode(imgPath)

  cmd.run("rm " + imgPath)

  let resolvedCaptcha = ""

  try {
    let captchaIoId = await FpManager.postCaptcha(b64Code)

    console.log("captchaIoId: ", captchaIoId)

    resolvedCaptcha = await FpManager.getCaptcha(captchaIoId)

    console.log("resolvedCaptcha: ", resolvedCaptcha)

  } catch (err) {
    throw new Error("captcha.io request Error: " + err)
  }

  // captcha手動輸入
  // const captcha = await askQuestion("captcha code?");
  // console.log("輸入了", captcha)
  await page.type("input[name='txtQryImageCode']", resolvedCaptcha)

  // 按下查詢
  await page.click('.formBtn input[value="查詢"]')
  //await page.click('.formBtn input[value="清除"]');

  // try {
	 //  console.log("等待跳轉")
	 //  await page.waitForNavigation({timeout: 2000});
  // } catch (err) {
  // 	console.log("無跳轉")
  // }

  // 停頓一秒
  await delay(2500)

    // 顯示驗證碼圖片的html
  let text1 = await page.$eval('table.lpTb', e => e.innerText)
  let text2 = ""
  try {
    text2 = await page.$eval('#invoiceDetailTable', e => e.innerText)
  } catch (err) {
  }

  //console.log(text1)
  console.log(text2)
  cmd.run('touch result-log')

  await browser.close()

 	// 在這邊可以確認結果後return
 	if (text1.match(/.*發票狀態.*/)) {
 		console.log("match 發票狀態")

	 	if (text1.match(/.*查無發票.*/)) {
      let message = "無效發票! 隨機碼: " + rNumber.toString()
      let toExCmd = 'echo "' + message + '" >> result-log'
      //console.log(toExCmd)
      cmd.run(toExCmd)
	 		console.log(message)

      return false
	  } else {
      if (text2 && text2.match(/.*品名.*/)) {

        let message = "有效發票!! 隨機碼: " + rNumber.toString() + " 內容: " + text2
        let toExCmd = 'echo "' + message + '" >> result-log'
        //console.log(toExCmd)
        cmd.run(toExCmd)
        console.log(message)

        return true
      } else {
        let message = "隨機碼不正確! 隨機碼: " + rNumber.toString()
        let toExCmd = 'echo "' + message + '" >> result-log'
        //console.log(toExCmd)
        cmd.run(toExCmd)
        console.log(message)

        return false
      }
    }
  }

  return false
}

// await page.type('#username', 'username');
// await page.type('#password', 'password');
// await page.click('#submit');
// await page.waitForNavigation();
// console.log('New Page URL:', page.url());

// 把數字轉換補零字串
function pad(num, size) {
  var s = num + ""
  while (s.length < size) s = "0" + s
  return s
}

// function to encode file data to base64 encoded string
function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  var b64Result = fs.readFileSync(file, { encoding: 'base64' })
  return b64Result
}

function askQuestion(query) {
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
      rl.close();
      resolve(ans);
  }))
}

var delay = function(s){
  return new Promise(function(resolve,reject){
   setTimeout(resolve,s);
  });
};