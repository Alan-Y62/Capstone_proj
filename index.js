const express = require('express');
const app = express();
const path = require('path');

const fs = require('fs');

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname + '/public/')))

app.get('/', (req,res) => {

})

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
})

