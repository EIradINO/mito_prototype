const express = require('express');
const router = express.Router();
const db = require('../models/index');
const kuromoji = require('kuromoji');


router.get('/', (req, res, next) => {
  db.Reflection.findAll().then(refs => {
    const data = {
      title: 'Reflections/Index',
      content: refs,
    }
    res.render('reflections/index', data)
  });
});

router.get('/add', (req, res, next) => {
  var data = {
    title: 'Reflections/Add'
  }
  res.render('reflections/add', data)
})

router.post('/add', (req, res, next) => {
  db.sequelize.sync()
    .then(() => db.Reflection.create({
      content: req.body.content,
    }))
    .then(ref => {
      console.log(req.body.content);
      var wordlist = []
      kuromoji.builder({
        dicPath: 'node_modules/kuromoji/dict'
      }).build((err, tokenizer) => {
        if (err) {
          throw err;
        }
        const tokens = tokenizer.tokenize(req.body.content)

        tokens.forEach((word) => {
          if (word.pos == '名詞' || word.pos == '形容詞') {
            wordlist.push(word.basic_form);
          }
        })
        console.log(wordlist);
      })
      res.redirect('/reflections')
    })
})

module.exports = router;