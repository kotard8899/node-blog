const express = require('express');
const router = express.Router();
const firebaseAdminDb = require('../connections/firebase_admin');
const categoriesRef = firebaseAdminDb.ref('categories');
const articlesRef = firebaseAdminDb.ref('articles');
const striptags = require('striptags');
const moment = require('moment');
const convertPagination = require('../modules/convertPagination');

/* GET home page. */
router.get('/', function(req, res, next) {
  let articles = [];
  let pages = {};
  articlesRef.orderByChild('update_time').once('value').then((snapshot) => {
    snapshot.forEach((child) => {
      if(child.val().status === 'public') {
        articles.push(child.val());
      }
    })
    articles.reverse();
    return categoriesRef.once('value');
  }).then((snapshot) => {
    const categories = snapshot.val();
    //pagination
    ({articles, pages} = convertPagination(articles, req.query.page));
    
    res.render('index', { 
      articles,
      categories,
      moment,
      striptags,
      pages
    });
  })
});
router.get('/post/:id', function(req, res, next) {
  const id = req.param('id');
  let article = {}
  articlesRef.child(id).once('value').then((snapshot) => {
    article = snapshot.val();
    if(!article) {
      return res.render('error', {
        title: '找不到該文章'
      })
    }
    return categoriesRef.once('value');
  }).then((snapshot) => {
    const categories = snapshot.val();
    res.render('post', { 
      article,
      categories,
      moment,
    });
  })
});

module.exports = router;
