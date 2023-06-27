const imailRu = require('../imailRu')
const data = {};
const emailControllers = {
  getTempimail: async (req, res) =>{
    try {
      const info = await imailRu.getTempimail();

      const email = await imailRu.getMessagesFromTempimail(info.csrfToken, info.cookies)
      data[info.csrfToken] = {
        cookies: email.cookies,
      }
      res.status(200).json({ data: JSON.parse(email.data), id: info.csrfToken})

    } catch (error) {
      res.status(500).json(error)
    }
  },
  getMessagesFromTempimail: async (req, res) =>{
    const id = req.params.id //req.query.id -- ?id=999
    if (id in data) {
      const email = await imailRu.getMessagesFromTempimail(id, data[id].cookies)
      res.status(200).json({ data: JSON.parse(email.data)})
    } else {
      res.status(403).json(`ID "${id}" does not exist in data.`)
    }
  },
  getGenerator: async (req, res) =>{
    try {
      const info = await imailRu.getGenerator();
      const dataInfo = JSON.parse(info)
      const email = dataInfo.email
      data[email] = {
        email: email,
      }
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

}

module.exports = emailControllers;