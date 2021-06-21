const express = require('express');
const elasticlunr = require('elasticlunr')
require('./lunr.stemmer.support.js')(elasticlunr);
require('./lunr.jp.js')(elasticlunr);
const db = require('../models');
const router = express.Router();
const kuromoji = require('kuromoji')

// 検索データ
const index = elasticlunr(function () {
  this.use(elasticlunr.jp);
  this.addField('title');
  this.addField('description');
  this.addField('link');
  this.addField('image');
  this.setRef('id');
});
db.Content.findAll().then(cts => {
  const startTime = performance.now()
  var i = 0;
  for (content of cts) {
    i++;
    index.addDoc({
      "id": i,
      "title": content.title,
      "description": content.description,
      "link": content.link,
      "image": content.image,
    })
  }
  const endTime = performance.now()
  console.log(endTime - startTime);
})

router.get('/', (req, res, next) => {
  db.Content.findAll().then(cts => {
    var data = {
      title: 'Contents/Index',
      contents: cts,
    }
    res.render('contents/index', data)
  });
})

router.post('/search', (req, res, next) => {
  const startTime = performance.now()
  db.sequelize.sync()
    .then(() => db.Reflection.create({
      content: req.body.content,
    }))
    .then(ref => {
      console.log(req.body.content);
      var wordList = []
      kuromoji.builder({
        dicPath: 'node_modules/kuromoji/dict'
      }).build((err, tokenizer) => {
        if (err) {
          throw err;
        }
        const tokens = tokenizer.tokenize(req.body.content)

        tokens.forEach((word) => {
          if (word.pos == '名詞' || word.pos == '形容詞') {
            wordList.push(word.basic_form);
          }
        })
        searchResult = []
        for (word of wordList) {
          const resultList = index.search(word, {
            fields: {
              title: {boost: 1},
              description: {boost: 2},
            },
            expand: true,
          });
          searchResult.push(resultList)
        }

        contentList = []
        scoreList = []
        for (i in searchResult) {
          contentList = contentList.concat(searchResult[i].map(obj => obj.ref))
          scoreList = scoreList.concat(searchResult[i].map(obj => obj.score))
        }

        duplicateCount = {}
        for (var i = 0; i < contentList.length; i++) {
          var elm = contentList[i];
          duplicateCount[elm] = (duplicateCount[elm] || 0) + 1;
        }

        resultContent = []
        if (wordList.length == 0 || wordList[0] == '*') {
          db.Reflection.findAll().then(refs => {
            const data = {
              title: 'Search',
              reflections: refs,
              results: resultContent,
              none: "検索結果がありません。"
            }
            res.render('contents/search', data)
          })
          const endTime = performance.now()
          console.log(endTime - startTime);
        } else if (wordList == 1) {
          duplicateList = Object.keys(duplicateCount).filter(num => duplicateCount[num] == times)

          function indexofall(num) {
            scr = []
            element = num
            idx = contentList.indexOf(element)
            while (idx != -1) {
              scr.push(idx)
              idx = contentList.indexOf(element, idx + 1)
            }
            return scr;
          }

          results = []
          j = 0;
          for (elm of duplicateList) {
            indexes = indexofall(elm)
            sc = 0
            for (i of indexes) {
              sc += scoreList[i]
            }
            results.push({ ref: duplicateList[j], score: sc })
            j++;
          }

          results.sort(function (a, b) {
            if (a.score > b.score) {
              return -1;
            } else {
              return 1;
            }
          });
          for (result of results) {
            resultContent.push(index.documentStore.docs[result.ref])
          }

          db.Reflection.findAll().then(refs => {
            const data = {
              title: 'Search',
              reflections: refs,
              results: resultContent,
              none: null,
            }
            res.render('contents/search', data)
          });
          const endTime = performance.now()
          console.log(endTime - startTime);
        } else {
          for (times = wordList.length; times > 0; times--) {
            duplicateList = Object.keys(duplicateCount).filter(num => duplicateCount[num] == times)

            function indexofall(num) {
              scr = []
              element = num
              idx = contentList.indexOf(element)
              while (idx != -1) {
                scr.push(idx)
                idx = contentList.indexOf(element, idx + 1)
              }
              return scr;
            }

            results = []
            j = 0;
            for (elm of duplicateList) {
              indexes = indexofall(elm)
              sc = 0
              for (i of indexes) {
                sc += scoreList[i]
              }
              results.push({ ref: duplicateList[j], score: sc })
              j++;
            }

            results.sort(function (a, b) {
              if (a.score > b.score) {
                return -1;
              } else {
                return 1;
              }
            });
            for (result of results) {
              resultContent.push(index.documentStore.docs[result.ref])
            }
          }

          // console.log(resultContent);
          db.Reflection.findAll().then(refs => {
            const data = {
              title: 'Search',
              reflections: refs,
              results: resultContent,
              none: null,
            }
            res.render('contents/search', data)
          });
          const endTime = performance.now()
          console.log(endTime - startTime);
        }
      })
    })
})

router.get('/search', (req, res, next) => {
  resultContent = []
  db.Reflection.findAll().then(refs => {
    const data = {
      title: 'Search',
      reflections: refs,
      results: resultContent,
      none: null,
    }
    res.render('contents/search', data)
  });
  // const endTime = performance.now()

  // console.log(endTime - startTime);
})

module.exports = router;