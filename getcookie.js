const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const fs1 = require('fs-extra');
const moment = require("moment");

function randomAlphanumeric(length = 8) {
  let str = "";
  for (let i = 0; i < 5; i++) {
    str += Math.random().toString(36).slice(2);
  }
  return str.substring(0, length);
};

async function accessWebsite(ID = null, idMessages = null) {
  return new Promise(async (resolve, reject)=>{
    try {
      const id = ID || randomAlphanumeric(15) + moment().format("YYYYMMDDhhmmss");
      let folderPath = `./${id}`
      fs.existsSync(folderPath) || fs.mkdirSync(folderPath, { recursive: true })
      puppeteer.use(StealthPlugin());
      let args = '--disable-web-security --disable-features=IsolateOrigins,site-per-process --enable-notifications --allow-read --ignore-certifcate-errors-spki-list --ignore-certifcate-errors --disable-infobars --disable-encryption --password-store=basic --gpm-disable-machine-id --gpm-disable-encryption --use-fake-ui-for-media-stream'.split(' ');
      const browser = await puppeteer.launch({
        userDataDir: folderPath,
        headless: "new", //"new", false
        ignoreHTTPSErrors: true,
        args,
        ignoreDefaultArgs: ["--enable-automation"],
      });

      const [page] = await browser.pages()

      page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('g.doubleclick.net')) {
          const cookies = await page.cookies();
          const cookie = cookies.find(c => c.name === 'cf_clearance');
          console.log(`cf_clearance=`, cookie.value);
          await browser.close();
          fs1.removeSync(folderPath);
          resolve(cookie.value);
        }
      });
      await page.goto(`https://temp-number.com`, {
        waitUntil: 'load',
        timeout: 0
      }).catch(() => {});
    } catch (error) {
      reject(error);
    }
  })
}

// accessWebsite(`2s3mbkvuzhiezst720230624114018`)

module.exports = {accessWebsite}
