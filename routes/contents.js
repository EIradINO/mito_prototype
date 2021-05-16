const express = require('express');
const db = require('../models');
const router = express.Router();

router.get('/', (req, res, next) => {
  db.Content.findAll().then(cts => {
    var data = {
      title: 'Contents/Index',
      contents: cts,
    }
    res.render('contents/index', data)
  })
})

module.exports = router;