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
    this.addField('link');
    this.addField('image');
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
        "link": content.link,
        "image": content.image,
      })
    }

    wordList = ["発芽", "肥料", "空気", "成長"]

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

    for (times = wordList.length; times > 1; times--) {
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

    console.log(resultContent);

    var data = {
      title: 'Search',
      contents: resultContent
    }


    res.render('contents/search', data)
  })
})

module.exports = router;