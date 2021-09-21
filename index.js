const express = require('express');
const app = express();
const path = require('path');

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname + '/public/')))

app.get('/', (req,res) => {
  //Do AUTH checks here
  res.redirect(req.baseUrl + '/public/' + req.query);
})


app.listen(port, () => {
  console.log(`Server running at port ${port}`);
})