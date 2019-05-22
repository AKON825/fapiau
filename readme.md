# 電子發票平台自動查詢爬蟲

# 使用captcha.io服務自動取得四位數隨機碼範例

實作流程:
  - 使用puppeteer.js模擬瀏覽器操作來screenshot來擷取驗證碼
  - 送到captcha.io進行驗證碼解析並取得結果
  - regular比對結果html查看隨機碼是否正確
  - 將執行結果記錄到result-log檔案內

前置作業:
  - hard code lib/fp.js中送到captcha.io的key(先到網站申請, 須付費)
  - hard code p.js中的
    ```sh
    await page.type("input[name='publicAuditVO.invoiceNumber']", 'QH35868107')
    ```
    程目標發票號碼, 以及hard code日期
    ```sh
    const date = "108/05/13"
    ```


### Installation
```sh
$ cd fapiau
$ npm install
```
puppeteer.js可能會有相關依賴套件未安裝導致錯誤, 若有缺直接搜尋後yum install補齊就行

### 執行

輸入要查詢的隨機碼區間如500到1000, 程式會one by one查詢
```sh
$ node p.js
```

### 執行範例
```sh
從幾號開始?500
到幾號結束?1000
500 - 1000
500 到 1000
500 '到' 1000
0500
照相
已產生驗證碼圖檔:  14-33-370500-驗證碼.png
captchaIoId:  446668
resolvedCaptcha:  6xzb9

match 發票狀態
隨機碼不正確! 隨機碼: 0500
隨機碼不是:  0500
0501
照相
已產生驗證碼圖檔:  14-33-520501-驗證碼.png
captchaIoId:  446689
resolvedCaptcha:  5kqhx

match 發票狀態
隨機碼不正確! 隨機碼: 0501
隨機碼不是:  0501
0502
```

### result-log
```sh
隨機碼不正確! 隨機碼: 0533
隨機碼不正確! 隨機碼: 0534
隨機碼不正確! 隨機碼: 0535
隨機碼不正確! 隨機碼: 0536
隨機碼不正確! 隨機碼: 0537
隨機碼不正確! 隨機碼: 0538
隨機碼不正確! 隨機碼: 0539
隨機碼不正確! 隨機碼: 0540
隨機碼不正確! 隨機碼: 0541
隨機碼不正確! 隨機碼: 0542
重試 隨機碼: 0543
重試 隨機碼: 0544
重試 隨機碼: 0545
重試 隨機碼: 0546
隨機碼不正確! 隨機碼: 0547
隨機碼不正確! 隨機碼: 0548
有效發票!! 隨機碼: 0549 內容: 序號      品名    數量    單價    小計
1       餐廳Restaurants 1.0     925.0   925.0
```

### 此專案僅供學術測試用途, 勿做ddos或網路攻擊相關行為