var axios = require('axios');
const cheerio = require('cheerio');
const imailRu = {
  getMessagesFromTempimail: async function (csrfToken, cookies) {
  return new Promise((resolve, reject)=>{
    var data = `_token=${csrfToken}&captcha=`;
    var config = {
      method: 'post',
      url: 'https://tempimail.org/messages',
      headers: { 
        Connection: 'keep-alive', 
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 
         'Cookie': `${cookies.join('; ')}`,
        DNT: '1', 
        'Origin': 'https://tempimail.org', 
        'Referer': 'https://tempimail.org/ru', 
        'Sec-Fetch-Dest': 'empty', 
        'Sec-Fetch-Mode': 'cors', 
        'Sec-Fetch-Site': 'same-origin', 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36', 
        'X-Requested-With': 'XMLHttpRequest', 
        'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"', 
        'sec-ch-ua-mobile': '?0', 
        'sec-ch-ua-platform': '"Windows"'
      },
      data : data
    };
    axios(config)
    .then(function (response) {
      const data = JSON.stringify(response.data)
      //console.log(data);
      const $ = cheerio.load(response.data);
      const setCookieHeader = response.headers['set-cookie'];
      //console.log(`setCookieHeader`, setCookieHeader)

      const csrfToken = $('meta[name="csrf-token"]').attr('content');
      
      // if (csrfToken) {
      //   console.log('CSRF Token:', csrfToken);
      // } else {
      //   console.log('CSRF token not found');
      // }
      resolve({data: data, cookies: setCookieHeader})
    })
    .catch(function (error) {
      reject(error);
      console.log(error);
    });
  })
  
}, 

  getTempimail: async function (){
  return new Promise((resolve, reject) =>{
    const headers = {
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
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    };
    
    axios.get('https://tempimail.org/ru', { headers })
      .then(response => {

        const $ = cheerio.load(response.data);
        const setCookieHeader = response.headers['set-cookie'];
        //console.log(`response.data`, response.data)
        const csrfToken = $('meta[name="csrf-token"]').attr('content');
        // if (csrfToken) {
        //   console.log('CSRF Token:', csrfToken);
        // } else {
        //   console.log('CSRF token not found');
        // }
        //console.log(`2321321321`,{csrfToken: csrfToken, cookies: setCookieHeader})
        resolve({csrfToken: csrfToken, cookies: setCookieHeader});
      })
      .catch(error => {
        reject(error)
        console.error(error);
      });
  })

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
  
    
  }
}

async function test(){
 let info = await imailRu.getTempimail()
//let mesages = await imailRu.getMessagesFromTempimail(info.csrfToken, info.cookies)
//console.log(mesages.data)
}
//test();

module.exports = imailRu;