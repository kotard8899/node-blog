const express = require('express');
const router = express.Router();
const firebaseAdminDb = require('../connections/firebase_admin');
const categoriesRef = firebaseAdminDb.ref('categories');
const articlesRef = firebaseAdminDb.ref('articles');
const countersRef = firebaseAdminDb.ref('counters');
const striptags = require('striptags');
const moment = require('moment');

router.get('/home', (req, res) => {
  let categories = {};
  let counters = {}
  categoriesRef.once('value').then((snapshot) => {
    categories = snapshot.val()
    return countersRef.once('value');
  }).then((snapshot) => {
    counters = snapshot.val();
    return articlesRef.once('value');
  }).then((snapshot) => {
    const articles = [];
    snapshot.forEach((child) => { 
      if(child.val().status === 'public'){
        articles.push(child.val()) 
      }
    })
    res.render('dashboard/dashboard-index', {
      categories,
      counters,
      articles
    })
  })
});
router.get('/archives', (req, res) => {
  let articles = [];
  let status = req.query.status || 'public';
  articlesRef.orderByChild('update_time').once('value').then((snapshot) => {
    snapshot.forEach((child) => {
      if(child.val().status === status) {
        articles.push(child.val());
      }
    })
    articles.reverse();
    return categoriesRef.once('value')
  }).then((snapshot) => {
    const categories = snapshot.val();
    const messages = req.flash('messages')
    res.render('dashboard/archives', {
      active: 'archive',
      articles,
      categories,
      moment,
      striptags,
      status,
      messages,
      hasMsg: messages.length > 0
    })
  })
});
router.get('/article/create', (req, res) => {
  categoriesRef.once('value').then((snapshot) => {
    const categories = snapshot.val();
    res.render('dashboard/article', {
      categories,
    })
  })
});
router.get('/article/:id', (req, res) => {
  const id = req.param('id');
  let categories = {};
  categoriesRef.once('value').then((snapshot) => {
    categories = snapshot.val();
    return articlesRef.child(id).once('value')
  }).then((snapshot) => {
    const article = snapshot.val();
    res.render('dashboard/article', {
      categories,
      article
    })
  })
});

router.get('/categories', (req, res) => {
  const messages = req.flash('messages');
  categoriesRef.once('value').then((snapshot) => {
    const categories = snapshot.val();
    res.render('dashboard/categories', {
      active: 'categories',
      messages,
      hasMsg: messages.length > 0,
      categories
    })
  })
});

router.post('/categories/create',(req, res) => {
  const categoryRef = categoriesRef.push();
  const data = req.body;
  data.id = categoryRef.key;
  categoriesRef.orderByChild('path').equalTo(data.path).once('value').then((snapshot) => {
    if(snapshot.val() !== null) {
      req.flash('messages', '路徑重複，請更換');
      res.redirect('/dashboard/categories');
    } else {
      categoryRef.set(JSON.parse(JSON.stringify(data))).then((snapshot) => {
        res.redirect('/dashboard/categories');
        const newGenre = {} 
        newGenre[data.id] = 0;
        countersRef.update(newGenre);
      })
    }
  })
});
router.post('/categories/remove/:id',(req, res) => {
  const id = req.param('id')
  categoriesRef.child(id).remove();
  countersRef.child(id).remove();
  req.flash('messages', '路徑已刪除');
  res.redirect('/dashboard/categories');
});
router.post('/archives/remove/:id',(req, res) => {
  const id = req.param('id')
  console.log(id)
  articlesRef.child(id).remove();
  req.flash('messages', '文章已刪除');
  res.send('文章已刪除');
  res.end();
});
router.post('/article/create',(req, res) => {
  const articleRef = articlesRef.push();
  const data = req.body;
  const updateTime = Math.floor(Date.now() / 1000);
  const key = articleRef.key
  data.id = key;
  data.update_time = updateTime;
  articleRef.set(JSON.parse(JSON.stringify(data)))
  .then(() => {
    res.redirect(`/dashboard/article/${key}`)
  })
});
router.post('/article/update/:id',(req, res) => {
  const id = req.param('id');
  const data = req.body;
  console.log(data)
  articlesRef.child(id).update(JSON.parse(JSON.stringify(data))).then(() => {
    res.redirect(`/dashboard/article/${id}`)
  })
})
module.exports = router;