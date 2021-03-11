// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!

const router = require('express').Router();
const bcrypt = require('bcryptjs');

const middleware = require('./auth-middleware');
const Users = require('../users/users-model');
/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }
  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }
  response on username taken:
  status 422
  {
    "message": "Username taken"
  }
  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */
  router.post('/register', middleware.checkUsernameFree, middleware.checkPasswordLength, (req,res) => {
    let user = req.body;
    
    const hash = bcrypt.hashSync(user.password, 12)

    user.password = hash;

    
    Users.add(user)
      .then(saved => {
        console.log(saved);
        if(saved)
          res.status(200).send(saved);
      })
  })

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }
  response:
  status 200
  {
    "message": "Welcome sue!"
  }
  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */
router.post('/login', middleware.checkUsernameExists, middleware.checkPasswordLength, (req,res) => {
  let { username, password } = req.body;

  Users.findByName(username)
    .then(user => {
      if(user && bcrypt.compareSync(password, user.password)){
        req.session.user = user;
        res.status(200).send({"message": `Welcome ${username}!`})
      }
      else 
        res.status(401).send({"message": "Invalid credentials"})
    })
})

/**
  3 [GET] /api/auth/logout
  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }
  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */
router.get('/logout', (req,res) => {
  if(req.session.user){
    req.session.destroy(err => {
      if(err)
        res.status(200).json({"message": "no session"})
      else
        res.status(200).json({"message": "logged out"})
    })
  }
  else
    res.status(200).json({"message": "no session"})

})

 module.exports = router;
// Don't forget to add the router to the `exports` object so it can be required in other modules