const imailRu = require('../imailRu')
const DATA = {};
const emailControllers = {
  getTempimail: async (req, res) =>{
    try {
      const info = await imailRu.getTempimail();
      const data = JSON.parse(info)
      DATA[data.id] = {
        cookies: data.cookie,
      }
      console.log(data.mailbox, data.id)
      res.status(200).json({ mailbox: data.mailbox, id: data.id})

    } catch (error) {
      res.status(500).json(error)
    }
  },
  getMessagesFromTempimail: async (req, res) =>{
    const id = req.params.id //req.query.id -- ?id=999
    if (id in DATA) {
      const info = await imailRu.getTempimail(DATA[id].cookies, id)
      res.status(200).json(JSON.parse(info))
    } else {
      res.status(403).json(`ID "${id}" does not exist in data.`)
    }
  },
  getGenerator: async (req, res) =>{
    try {
      const info = await imailRu.getGenerator();
      const dataInfo = JSON.parse(info)
      res.status(200).json(dataInfo)
    } catch (error) {
      res.status(500).json(error)
    }
  },

  getMessagesFromGenerator: async (req, res) =>{
    const emailParams = req.params.email
    try {
      const email = await imailRu.getGenerator(emailParams)
      res.status(200).json(JSON.parse(email))
    } catch (error) {
      res.status(500).json(error)
    }
  },
  getMohmal: async (req, res) =>{
    try {
      const email = await imailRu.getMohmal()
      res.status(200).json(JSON.parse(email))
    } catch (error) {
      res.status(500).json(error)
    }
  },
  getMessagesFromMohmal: async (req, res) =>{
    const id = req.params.id
    try {
      const email = await imailRu.getMohmal(id)
      res.status(200).json(JSON.parse(email))
    } catch (error) {
      res.status(500).json(error)
    }
  },
  getTempMailBox: async (req, res) =>{
    try {
      const info = await imailRu.getTempMailBox();
      const data = JSON.parse(info)
      DATA[data.id] = {
        cookies: data.cookie,
      }
      res.status(200).json({ mailbox: data.mailbox, id: data.id})

    } catch (error) {
      res.status(500).json(error)
    }
  },
  getMessagesFromTempMailBox: async (req, res) =>{
    const id = req.params.id //req.query.id -- ?id=999
    if (id in DATA) {
      const info = await imailRu.getTempMailBox(DATA[id].cookies, id)
      res.status(200).json(JSON.parse(info))
    } else {
      res.status(403).json(`ID "${id}" does not exist in data.`)
    }
  },
  getHotmail: async (req, res) =>{
    try {
      const info = await imailRu.getHotmail();
      const dataInfo = JSON.parse(info)
      res.status(200).json(dataInfo)
    } catch (error) {
      res.status(500).json(error)
    }
  },

  getMessagesFromHotmail: async (req, res) =>{
    const url = `https://www.hot-mail.gq/mailbox/${req.params.email}`
    try {
      const email = await imailRu.getHotmail(url)
      res.status(200).json(JSON.parse(email))
    } catch (error) {
      res.status(500).json(error)
    }
  },
  getCountries: async (req, res) =>{
    try {
      const countries = await imailRu.getNunber();
      res.status(200).json(JSON.parse(countries))
    } catch (error) {
      res.status(500).json(error)
    }
  },
  getNumber: async (req, res) =>{
    try {
      const country = req.params.country
      const numbers = await imailRu.getNunber(country);
      res.status(200).json(JSON.parse(numbers))
    } catch (error) {
      res.status(500).json(error)
    }
  },
  getMessagesFromNumber: async (req, res) =>{
    try {
      const country = req.params.country
      const number = req.params.number
      const numbers = await imailRu.getNunber(country, number);
      res.status(200).json(JSON.parse(numbers))
    } catch (error) {
      res.status(500).json(error)
    }
  },
  getNumberOnline: async (req, res) =>{
    try {
      const numbers = await imailRu.getNumberOnline();
      res.status(200).json(JSON.parse(numbers))
    } catch (error) {
      res.status(500).json(error)
    }
  },
  getMessagesFromNumberOnline: async (req, res) =>{
    try {
      const number = req.params.number
      const messages = await imailRu.getNumberOnline(number);
      res.status(200).json(JSON.parse(messages))
    } catch (error) {
      res.status(500).json(error)
    }
  },
  getNumberReceive: async (req, res) =>{
    try {
      const numbers = await imailRu.getNumberReceive();
      res.status(200).json(JSON.parse(numbers))
    } catch (error) {
      res.status(500).json(error)
    }
  },
  getMessagesFromNumberReceive: async (req, res) =>{
    try {
      const number = req.params.number
      const messages = await imailRu.getNumberReceive(number);
      res.status(200).json(JSON.parse(messages))
    } catch (error) {
      res.status(500).json(error)
    }
  },
}

module.exports = emailControllers;