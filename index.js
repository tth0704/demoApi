const express = require('express')
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')
const emailRoute = require('./router/email')
const {accessWebsite} = require('./getcookie');
const app = express();
app.use(cors());
app.use(morgan());
app.use(cookieParser());

app.use(express.json());
app.use("/v1", emailRoute)
app.use("/v2", async (req, res) =>{
  accessWebsite()
  .then((result) =>{
    res.status(200).json(result)
  })
  .catch((error)=>{
    res.status(500).json(error)
  })
})

app.listen(process.env.PORT || 3000, ()=>{
  console.log('Server is running')
})

