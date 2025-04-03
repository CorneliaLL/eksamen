/* import 
const { signup } = require('./controllers/userController');

// //{ id: 1, name: "cornelia", }
// app.get('/users/1', userController.getSingleUser)

const express = require('express');
const router = express.Router();

router.get('/signup', (req, res) => {
    try {
        signup();
        return res.send('User home route');
    } catch (error) {
        return console.log(error);
    }
  });

module.exports = router;

*/