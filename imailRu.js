var axios = require('axios');
const cheerio = require('cheerio');
const request = require('request');
const { convert } = require('html-to-text');
const options = {
  wordwrap: 130,
  // ...
};
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
        const html = $('#email-table div[class="e7m mess_bodiyy"]').html();
        const text = convert(html, options);
        const content = {
          from: $('#email-table div[class="e7m from_div_45g45gg"]').first().text(),
          subject: $('#email-table div[class="e7m subj_div_45g45gg"]').first().text(),
          receivedAt: $('#email-table div[class="e7m time_div_45g45gg"]').first().text(),
          content: text,
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
        const html = $('div[dir="ltr"]').html();
        const text = convert(html, options);
      const content = text
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
      //console.log(`setCookieHeader`, response.headers)
      const desiredCookies = setCookieHeader
      .flatMap(cookies => cookies.split(';'))
      .filter(cookie => /^((XSRF-TOKEN|tempmailbox_session|email)=)/.test(cookie.trim())).join('; ');
      console.log(`desiredCookies`, desiredCookies)
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
  },

  getNunber: async function getNumber(country = null, number = null){
    return new Promise((resolve, reject) => {
      try {
        var config = {
          method: 'GET',
          url: `https://temp-number.com${country ? `/countries/` + country : `/`}`,
          headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'accept-language': 'vi,ru;q=0.9',
            'cookie': 'PHPSESSID=a6342c1b9af8d8fd1a88b2f5282146d9; __gads=ID=b6f2ff876f50ce2b:T=1717578679:RT=1717578679:S=ALNI_MbqBpbmCwf9AtwCD1z_LxMkweiRYg; __gpi=UID=00000e419a71b61a:T=1717578679:RT=1717578679:S=ALNI_MYiRCFF0vZ5hEIp-x5gOVYlQI3I7w; __eoi=ID=94273c23f633701a:T=1717578679:RT=1717578679:S=AA-Afja1qZePk3ZQxhpgWb13_8Ns; _ga=GA1.1.659610773.1717578680; cf_clearance=JYjwC.nJkVzSqm0Lh9WAwDCzf2GNERoA8LY_3xpQeD4-1717578680-1.0.1.1-_P91bRf1FgfLv4scxfFXvugX0pWTpbZenGynLmtK9V2UPl9jE_qlsYk5iLisxnd.gamls_nHeIOdK17nP97IcQ; cfz_google-analytics_v4=%7B%22cyUh_engagementDuration%22%3A%7B%22v%22%3A%220%22%2C%22e%22%3A1749114732751%7D%2C%22cyUh_engagementStart%22%3A%7B%22v%22%3A%221717578732751%22%2C%22e%22%3A1749114732751%7D%2C%22cyUh_counter%22%3A%7B%22v%22%3A%224%22%2C%22e%22%3A1749114732751%7D%2C%22cyUh_ga4sid%22%3A%7B%22v%22%3A%221971905600%22%2C%22e%22%3A1717580532751%7D%2C%22cyUh_session_counter%22%3A%7B%22v%22%3A%221%22%2C%22e%22%3A1749114732751%7D%2C%22cyUh_ga4%22%3A%7B%22v%22%3A%2253d27964-c453-4343-879d-9c97eec6ddb1%22%2C%22e%22%3A1749114732751%7D%2C%22cyUh__z_ga_audiences%22%3A%7B%22v%22%3A%2253d27964-c453-4343-879d-9c97eec6ddb1%22%2C%22e%22%3A1749114679067%7D%2C%22cyUh_let%22%3A%7B%22v%22%3A%221717578732751%22%2C%22e%22%3A1749114732751%7D%7D; FCNEC=%5B%5B%22AKsRol8IEUYfsumCiooyWWOEQlbl6yJ6bfNwceKqWYc1adVG3oUPCF7Zb0xUpcYFF-ImU0Xd1DLYgVpNVwGblLX69fX3UD0jP_XQft1smeN6LqvN4okUmIzECIKyRFub-C7SEIqcmzymNXXuDoZxS4CH6zs108YJng%3D%3D%22%5D%2Cnull%2C%5B%5B2%2C%22%5Bnull%2C%5Bnull%2C2%2C%5B1717578680%2C956936000%5D%5D%5D%22%5D%5D%5D; _ga_8DHDBE6JGY=GS1.1.1717578680.1.1.1717578736.4.0.0; Cookie_1=value; cf_clearance=kY2VNo8k..A3nnAoBummAaG3DYF6XSD6xouRqcT1Q6A-1715325895-1.0.1.1-NlxI.e46ltKqG9ER6ITxj4KHsvRCnEckKC95nv5k.6O2MOCnN3M1n1pRjgBIJqORO9BUTqIIzknJKL1ml7scIA',
            'dnt': '1',
            'priority': 'u=0, i',
            'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-ch-ua-arch': '"x86"',
            'sec-ch-ua-bitness': '"64"',
            'sec-ch-ua-full-version': '"125.0.6422.142"',
            'sec-ch-ua-full-version-list': '"Google Chrome";v="125.0.6422.142", "Chromium";v="125.0.6422.142", "Not.A/Brand";v="24.0.0.0"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-model': '""',
            'sec-ch-ua-platform': '"Windows"',
            'sec-ch-ua-platform-version': '"15.0.0"',
            'sec-fetch-dest': 'document',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
          },
          // proxy: {
          //   protocol: 'http',
          //   host: '147.185.238.777',
          //   port: 50002,
            // auth: {
            //   username: 'this.UserName',
            //   password: 'this.Password',
            // },
          // },
          //proxy: `http://147.185.238.777:50002`
        };
        // if (this.UserName) {
        //   var auth = 'Basic ' + new Buffer(`${this.UserName.trim()}:${this.Password.trim()}`).toString('base64')
        //   config.headers = {
        //     "Proxy-Authorization" : auth,
        //   }
        // }
        number ? (config.url = `https://temp-number.com/temporary-numbers/${country ? country : 'United-States'}/${number}/1`) : '';
        request(config, (error, response, body) => {
          if (error) {
            console.error(error);
            reject(error);
          } else {
            //
            //const setCookieHeader = response.headers['cookie'];
            console.log(`body`, body)
            //
            const $ = cheerio.load(body);
            const countryBox = $('div[class="col-xs-12 col-sm-4 col-md-4 col-lg-4 country-box"]')
        const data = []
        if (!country) {
          const countries = $('div[class="col-xs-12 col-sm-4 col-md-4 col-lg-4"]')
          for (let i = 0; i < countries.length; i++) {
            const row = $(countries[i]).find('a').attr('href');
            data.push(row.split('/')[1]);
          }
        }else if (!number) {
          for (let i = 0; i < countryBox.length; i++) {
            const row = $(countryBox[i]);
            const timeTop = row.find('div.add_time-top').text();
            const card = row.find('h4.card-title').text();
            data.push({time: timeTop, card: card});
          }
        }else{
          const mesages = $('div#messages div[class="direct-chat-msg left"]')
          for (let i = 0; i < mesages.length; i++) {
            const row = $(mesages[i]);
            const from = row.find('span.direct-chat-name').text()
            const time =  row.find('time.timeago.direct-chat-timestamp.pull-left').text()
            const content = row.find('div.direct-chat-text').text()
            data.push({mesages: i+1, from: from, time: time, content: content });
          }
          
        }
            
            resolve(JSON.stringify({data: data}))
          }
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
    
  },
  getNumberOnline: async function getNumberOnline(number = null, Url = null, quantity = null){
    try {
      var config = {
        method: 'get',
        url: `https://online-sms.org`,
        headers: { 
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        },
      };
      number ? config.url = `https://online-sms.org/free-phone-number-${number}` : ""
      Url ? config.url = Url : ''
      //
      const response = await axios(config)
      const $ = cheerio.load(response.data)
      const data = []
      if (!number && Url) {
        const numbers = $('div[class="col-sm-12 col-md-4"]')
        console.log(numbers.length)
        for (let i = 0; i < numbers.length; i++) {
          const row = $(numbers[i]).find('a').text();
          data.push(row.split('\n')[1]);
        }
      }else if(!number){
        const numbers = $('div[class="js-numbers-item col-sm-12 col-md-4"]')
        console.log(numbers.length)
        for (let i = 0; i < numbers.length; i++) {
          const row = $(numbers[i]).find('a').text();
          data.push(row.split('\n')[1]);
        }
      }else{
        const rows = $('table[class="table table-condensed table-responsive-sm table-hover table-striped num-sms"] >tbody >tr')
        for (let i = 0; i < rows.length; i++) {
          const row = $(rows[i]);
          const from = row.find('a').text()
          const time =  row.find('td.t-m-r').text()
          const contents = row.find('td')
          const content = $(contents[1]).text().split('\n')[1];
          data.push({mesages: i+1, from: from, time: time, content: content });
        }
        
      }
      if(quantity){
        //https://online-sms.org/inactive?country=VN&page=1
        for (let i = 2; i < i+1; i++) {
          try {
            if (data.length >= quantity) {
              break
            }else{
              const urlNextPage = Url.split('&')[0] + `&page=${i}`
              const info = await getNumberOnline(null, urlNextPage.trim());
              const numbers = JSON.parse(info)
              if(numbers.data.length === 0) break;
              data.push(...numbers.data)
            }
          
          } catch (error) {
            break
          } 
        }
        if (data.length > quantity) {
          const modifiedData = data.splice(0, quantity)
          return JSON.stringify({data: modifiedData})
        }
      }
      return JSON.stringify({data: data})
    } catch (error) {
      console.log(error);
    }
  
    
  },
  getNumberReceive: async function getNumberReceive(number = null){
    try {
      var config = {
        method: 'get',
        url: `https://receive-smss.com/`,
        headers: { 
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        },
      };
      number ? config.url = `https://receive-smss.com/sms/${number}/` : ""
  
      const response = await axios(config)
      console.log("response.data",config)
      const $ = cheerio.load(response.data)
      const data = []
      if (!number) {
        const numbers = $('div[class="number-boxes-itemm-number"]')
        for (let i = 0; i < numbers.length; i++) {
          const row = $(numbers[i]).text();
          data.push(row);
        }
      }else{
        const rows = $('div[class="row message_details"]')
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const from = $(row).find('div.col-md-3.senderr>a').text();
          const content =  $(row).find('div.col-md-6.msgg>span').text();
          const time = $(row).find('div.col-md-3.time').text().split('Time')[1];
          data.push({mesages: i+1, from: from, time: time, content: content });
        }
        
      }
      
    return JSON.stringify({data: data})
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