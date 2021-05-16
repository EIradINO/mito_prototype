const express = require('express');
const elasticlunr = require('elasticlunr')
require('./lunr.stemmer.support.js')(elasticlunr);
require('./lunr.jp.js')(elasticlunr);
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

router.get('/search', (req, res, next) => {
  const index = elasticlunr(function () {
    this.use(elasticlunr.jp);
    this.addField('title');
    this.addField('description');
    this.setRef('id');
  });
  db.Content.findAll().then(cts => {
    var i = 0;
    for (content of cts) {
      i++;
      index.addDoc({
        "id": i,
        "title": content.title,
        "description": content.description,
      })
    }

    wordlist = ["空", "青い", "の", "気"]
    for (word of wordlist) {
      const r = index.search(word, {
        fields: {
          title: {boost: 1},
          description: {boost: 1},
        },
        expand: true,
      });
      console.log(r);
    }
    res.render('contents/search', { title: 'Search' })
  })
})

module.exports = router;