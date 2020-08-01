const firebaseClient = require('../connections/firebase_client');
const router = require('./dashboard');


router.get('/signup', (req, res) => {
  const errors = req.flash('errors');
  const successMsg = req.flash('success');
  res.render('dashboard/signup', {
    errors,
    successMsg,
    hasError: errors.length > 0,
    hasMsg: successMsg.length > 0
  })
});
router.get('/login', (req, res) => {
  const errors = req.flash('errors');
  res.render('dashboard/login', {
    errors,
    hasError: errors.length > 0,
  })
});

router.post('/signup', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirm_password;
  if(password !== confirmPassword) {
    req.flash('errors', '兩組密碼不相符')
    res.redirect('/auth/signup');
  }
  firebaseClient.auth().createUserWithEmailAndPassword(email, password)
  .then(() => {
    req.flash('success', '註冊成功');
    res.redirect('/auth/signup');
  })
  .catch((error) => {
    const errorMessage = error.message;
    req.flash('errors', errorMessage);
    res.redirect('/auth/signup');
  })
});
router.post('/login', (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  firebaseClient.auth().signInWithEmailAndPassword(email, password)
  .then((user) => {
    req.session.uid = user.user.uid;
    req.session.mail = user.user.email;
    res.redirect('/dashboard/home');
  })
  .catch((error) => {
    const errorMessage = error.message;
    req.flash('errors', errorMessage);
    res.redirect('/auth/login');
  })
});

router.post('/signout', (req, res) => {
  firebaseClient.auth().signOut();
  req.session.destroy((err) => {
    if(err){
      console.log(err);
    }else{
      res.redirect('/auth/login');
    }
  })
})

module.exports = router;