const imailRu = require('../imailRu')
const DATA = {};
const emailControllers = {
  getTempimail: async (req, res) =>{
    try {
      const info = await imailRu.getTempimail();

      const email = await imailRu.getMessagesFromTempimail(info.csrfToken, info.cookies)
      DATA[info.csrfToken] = {
        cookies: email.cookies,
      }
      res.status(200).json({ data: JSON.parse(email.data), id: info.csrfToken})

    } catch (error) {
      res.status(500).json(error)
    }
  },
  getMessagesFromTempimail: async (req, res) =>{
    const id = req.params.id //req.query.id -- ?id=999
    if (id in DATA) {
      const email = await imailRu.getMessagesFromTempimail(id, DATA[id].cookies)
      res.status(200).json({ data: JSON.parse(email.data)})
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
  }
}

module.exports = emailControllers;