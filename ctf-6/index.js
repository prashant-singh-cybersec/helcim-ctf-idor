const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const jwt = require('jsonwebtoken');
const secretKey = 'nice-to-meet-you'; // Replace with your secret key


// Set up session middleware
app.use(session({
  secret: 'nice-to-meet-you',
  resave: false,
  saveUninitialized: true
}));



// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {

  const indexPath = path.join(__dirname, 'public', 'login.html');
  res.sendFile(indexPath);
});

// Login route
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const cardid = req.body.cardid;

  // Perform authentication logic
  if (username === 'barry' && password === 'barry123') {

     // Authentication successful

     const user = { id: 1, isAdmin: false, cardid: cardid };
     const token = jwt.sign(user, secretKey, { algorithm: 'HS256', expiresIn: '1h' }); // Token will expire in 1 hour
     res.json({ token });


  }

  else {
    // Authentication failed

    return res.status(401).sendFile(path.join(__dirname, 'public', 'its-ok-at-least-you-tried.jpg'));
  }
});

// Assuming you are already authenticated as Barry Allen.

// Array to store user data (In a real application, this should be replaced with a database)
let cardData = [
  { id: 1, cardId: '38b3eff8baf56627478ec76a704e9b52', name: 'Barry Allen', Card_Number: 5413330089099130, Expiry_date: '01/25', CVV: '100' },
  { id: 2, cardId: 'ec8956637a99787bd197eacd77acce5e', name: 'Alex', Card_Number: 5413330089020011, Expiry_date: '01/25', CVV: '101' },
  { id: 3, cardId: '6974ce5ac660610b44d9b9fed0ff9548', name: 'Mandeep', Card_Number: 5413334579020011, Expiry_date: '01/25', CVV: '102' },
  { id: 4, cardId: 'c9e1074f5b3f9fc8ea15d152add07294', name: 'Prashant', Card_Number: 5413330123020011, Expiry_date: '01/25', CVV: '103' }
];

// Authorization middleware
function authorize(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).sendFile(path.join(__dirname, 'public', 'its-ok-at-least-you-tried.jpg'));
  }

  try {
    const decodedToken = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
    console.log(decodedToken);
    req.dtoken = decodedToken;
    next();
  } catch (error) {
    return res.status(401).sendFile(path.join(__dirname, 'public', 'its-ok-at-least-you-tried.jpg'));
  }
}



// Route to get Card details by User ID
app.get('/cardData/users', authorize, (req, res) => {
  const id = req.dtoken.cardid.toString();;
  console.log("Route ids are:", id);


  const users = cardData.find(u => u.cardId === id);

  if (users.id !== 1) {
    res.set('flag', 'helcim{Break_The_JWT_Logic}');
  }
  res.json(users);
  console.log(users);
});





// Route to update user details by ID
app.post('/cardData/users/', authorize, (req, res) => {


  const id = parseInt(req.params.id);
  const user = cardData.find(u => u.id === id);
  user.name = req.body.name;
  res.json({ message: 'User updated successfully' });
});


// 404 route handler
app.use((req, res, next) => {
  res.status(404).send('404 - Page Not Found');
});


// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
