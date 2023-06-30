var axios = require('axios');
const cheerio = require('cheerio');
const imailRu = {
  getTempimail: async function getTempimail(Cookie = null, CsrfToken = null, callBack = false){
    try {
      var config = {
        method: 'get',
        url: 'https://tempimail.org/en',
        headers: { 
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        },
      };
      Cookie ? (config.method = 'post', config.headers.cookie = Cookie, config.data = `_token=${CsrfToken}&captcha=`, config.url = `https://tempimail.org/messages`) : "";
    
      const response = await axios(config)
      const data = JSON.stringify(response.data)
      const $ = cheerio.load(response.data)
      const setCookieHeader = response.headers['set-cookie'];
      const desiredCookies = setCookieHeader
      .flatMap(cookies => cookies.split(';'))
      .filter(cookie => /^((XSRF-TOKEN|tempimail_session|email)=)/.test(cookie.trim())).join('; ');
     
      if (!Cookie) {
        const csrfToken = $('meta[name="csrf-token"]').attr('content');
        const info = await getTempimail(desiredCookies, csrfToken, true)
        return JSON.stringify({mailbox: info.data.mailbox, id: csrfToken, cookie: info.cookie});
  
      }else if(callBack){
        return {data: response.data, cookie: desiredCookies}
      }else{
        return data
      }
    
    } catch (error) {
      console.log(error);
    }
  },
  getGenerator: async function getEmail(email = null, path = null) {
    try {
      const headers = {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        Dnt: '1',
        'Sec-Ch-Ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      };
  
      if (email) {
        headers.Cookie = `surl=${encodeURIComponent(email.split('@')[1])}%2F${encodeURIComponent(email.split('@')[0])}${path ? `%2F${encodeURIComponent(path.split('/').pop())}` : ''}`;
      }
  
      let rearPath = `email-generator`
      if(email) rearPath = email;
      if(path) rearPath = path;
  
      const info = {};
      const messages = [];
  
      const response = await axios.get(`https://generator.email/${rearPath}`, { headers });
      const $ = cheerio.load(response.data);
  
      const emailText = $('#email_ch_text').text();
      //console.log(`email`, emailText);
  
      const emailTable = $('#email-table').html();
      //console.log(`emailTable`, emailTable);
  
      if (emailTable && emailTable.includes('e7m mess_bodiyy')) {
        const content = {
          from: $('#email-table div[class="e7m from_div_45g45gg"]').first().text(),
          subject: $('#email-table div[class="e7m subj_div_45g45gg"]').first().text(),
          receivedAt: $('#email-table div[class="e7m time_div_45g45gg"]').first().text(),
          content: $('#email-table div[class="e7m mess_bodiyy"]').html(),
        };
        messages.push(content);
        //console.log(`content`, content);
      } else {
        if (emailTable) {
          const emailLinks = $('#email-table a');
          for (let i = 0; i < emailLinks.length; i++) {
            const hrefValue = $(emailLinks[i]).attr('href').substring(1);
            const data = await getEmail(email, hrefValue);
            messages.push(JSON.parse(data).messages[0]);
          }
          //console.log('Table');
        } else {
          //console.log(`No messages`);
        }
      }
  
      info.email = emailText;
      info.messages = messages;
      return JSON.stringify(info);
    } catch (error) {
      console.error(`error`, error);
      throw error;
    }
  },
  getMohmal: async function getMohmal(cookie = null, path = null){
    try {
      var config = {
        method: 'get',
        maxRedirects: 0,
        validateStatus: false,
        url: 'https://www.mohmal.com/en/create/random',
        headers: { 
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
         }
      };
      cookie ? (config.headers.Cookie = `connect.sid=${cookie}` , config.url = 'https://www.mohmal.com/en/inbox') : ""
      path ? config.url = path : "";
  
      const info = {};
      const messages = [];
      const response = await axios(config)
      const $ = cheerio.load(response.data)
   
      if (!cookie) {
      const setCookieHeader = response.headers['set-cookie'];
      const matches = setCookieHeader[0].match(/connect\.sid=([^;]+)/);
      const connectSid = matches[1];
  
      const email = await getMohmal(connectSid)
      info.email = JSON.parse(email).email
      info.id = connectSid
      return JSON.stringify(info);
      }else if (!path) {
      const email = $('#email div[class="email"]').attr('data-email')
      if (email) {
        info.email = email
        const idMessages = $('#inbox-table >tbody >tr')
        for (let i = 0; i < idMessages.length; i++) {
          const tr = $(idMessages[i])
          const id = tr.attr('data-msg-id');
          if (!id) {
            continue;
          }
          const subject = tr.find('td.subject').text()
          const time = tr.find('td.time').text()
          const sender = tr.find('td.sender').text()
  
          const content = await getMohmal(cookie,`https://www.mohmal.com/en/message/${id}` )
          const infoMesages = {subject: subject, time: time, sender: sender, content: content}
          messages.push(infoMesages)
        }
      }else{
        info.email = "Expired email"
      }
      info.messages = messages
      return JSON.stringify(info);
      }else{
      const content = $('div[dir="ltr"]').html()
      return content;
      }
  
    } catch (error) {
      console.log(error);
      return null
    }
  
    
  },
  getTempMailBox: async function getTempMailBox(Cookie = null, CsrfToken = null, callBack = false){
    try {
      var config = {
        method: 'get',
        maxRedirects: 0,
        validateStatus: false,
        url: 'https://temp-mailbox.com/en',
        headers: { 
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        },
      };
      Cookie ? (config.method = 'post', config.headers.cookie = Cookie, config.data = `_token=${CsrfToken}&captcha=`, config.url = `https://temp-mailbox.com/messages`) : "";
    
      const response = await axios(config)
      const data = JSON.stringify(response.data)
      const $ = cheerio.load(response.data)
      const setCookieHeader = response.headers['set-cookie'];
      //console.log(`setCookieHeader`, setCookieHeader)
      const desiredCookies = setCookieHeader
      .flatMap(cookies => cookies.split(';'))
      .filter(cookie => /^((XSRF-TOKEN|tempmailbox_session|email)=)/.test(cookie.trim())).join('; ');
      //console.log(`desiredCookies`, desiredCookies)
      if (!Cookie) {
        const csrfToken = $('meta[name="csrf-token"]').attr('content');
        //console.log(`csrfToken`, csrfToken)
        const info = await getTempMailBox(desiredCookies, csrfToken, true)
        return JSON.stringify({mailbox: info.data.mailbox, id: csrfToken, cookie: info.cookie});
      }else if(callBack){
        return {data: response.data, cookie: desiredCookies}
      }else{
        return data
      }
    } catch (error) {
      console.log(error);
    }
  },
  getHotmail: async function getHotMail( Url = null,  Cookie = null){
    try {
      var config = {
        method: 'get',
        url:   'https://www.hot-mail.gq/mailbox',
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        }
      };
      Url ? config.url = Url  : ""; 
      Cookie ? config.headers.cookie = Cookie : ""
      const response = await axios(config)
      const data = JSON.stringify(response.data);
      const setCookieHeader = response.headers['set-cookie'];
      const $ = cheerio.load(response.data)
      const emailValue = $('#current-id').attr('value');
  
      const desiredCookies = setCookieHeader
      .flatMap(cookies => cookies.split(';'))
      .filter(cookie => /^((XSRF-TOKEN|hotmail_temporary_email_session)=)/.test(cookie.trim())).join('; ');
      //console.log(`desiredCookies`, desiredCookies)
  
      //console.log(`email`, emailValue)
      if (!Url) {
        return JSON.stringify({email: emailValue});
      }else if(!Cookie){
        const cookieCustom = await getHotMail(`https://www.hot-mail.gq/css/custom.css`,  desiredCookies)//https://www.hot-mail.gq/ads/4
        const cookieCustom2 = await getHotMail(`https://www.hot-mail.gq/mail/fetch?new=true`,  cookieCustom)
        const info = await getHotMail(`https://www.hot-mail.gq/mail/fetch`,  cookieCustom)
        return info
      }else if(Url === `https://www.hot-mail.gq/mail/fetch`){
        return data
      }else{
        return desiredCookies
      }
    } catch (error) {
      console.log(error);
    }
  }
}

async function test(){
 let info = await imailRu.getTempimail()
//let mesages = await imailRu.getMessagesFromTempimail(info.csrfToken, info.cookies)
//console.log(mesages.data)
}
//test();

module.exports = imailRu;