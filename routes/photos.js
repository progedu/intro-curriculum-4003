'use strict';
let express = require('express');
let router = express.Router();

router.get('/', (req, res, next) => {
  res.send('Some photos');
});

router.param('title', (req, res, next, title) => {
  res.send(title);
  next();
});

router.get('/:title', (req, res, next) => {
  res.end();
});


module.exports = router;
