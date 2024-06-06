const express = require('express')
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')
const emailRoute = require('./router/email')
const app = express();
app.use(cors());
app.use(morgan());
app.use(cookieParser());

app.use(express.json());
app.use("/v1", emailRoute)
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
  console.log(`Server is running ${port}`)
})


