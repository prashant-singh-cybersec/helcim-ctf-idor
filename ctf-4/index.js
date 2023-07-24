const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const base64 = require('base-64');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Use cookie-parser middleware
app.use(cookieParser());


// Set up session middleware
app.use(session({
  secret: 'nice-to-meet-you',
  resave: false,
  saveUninitialized: true
}));

/// Function to create and set the custom cookie
function setCustomCookie(req, res, next) {

  const timestamp = Date.now();
  const userId = '1';

  // Combine timestamp and user ID as an object
  const cookieData = { timestamp, userId };

  // Convert the object to JSON string and then base64 encode it
  const encodedCookieData = base64.encode(JSON.stringify(cookieData));

  // Set the custom cookie in the response
  req.cookieheader = encodedCookieData;
  

  next();
}


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {

  const indexPath = path.join(__dirname, 'public', 'login.html');
  res.sendFile(indexPath);
});

// Login route
app.post('/login', setCustomCookie, (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Perform authentication logic
  if (username === 'barry' && password === 'barry123') {
    // Authentication successful

    const encodedCookieData = req.cookieheader;
    res.cookie('SessionID', encodedCookieData, { maxAge: 3600000 }); // Cookie expires in 1 hour


    res.redirect('/profile.html');


  }

  else {
    // Authentication failed
    res.send('Invalid credentials');
  }
});

// Assuming you are already authenticated as Barry Allen.

// Array to store user data (In a real application, this should be replaced with a database)
let cardData = [
  { id: 1, name: 'Barry Allen', Card_Number: 5413330089099130, Expiry_date: '01/25', CVV: '100' },
  { id: 2, name: 'Alex', Card_Number: 5413330089020011, Expiry_date: '01/25', CVV: '101' },
  { id: 3, name: 'Mandeep', Card_Number: 5413334579020011, Expiry_date: '01/25', CVV: '102' },
  { id: 4, name: 'Prashant', Card_Number: 5413330123020011, Expiry_date: '01/25', CVV: '103' }
];

// Authorization middleware
function authorize(req, res, next) {

  if(!req.cookies.SessionID)

  {
    res.send('login First');
  }
  
  const encodedcookie = req.cookies.SessionID;

  const decodedCookieData = base64.decode(encodedcookie);
  // Parse the JSON data
  const cookieData = JSON.parse(decodedCookieData);
  console.log(cookieData);

  const id = req.query.id;

  if (id.length > 1) {
    return res.status(401).sendFile(path.join(__dirname, 'public', 'its-ok-at-least-you-tried.jpg'));
  }
  const user = cardData.find(u => id.includes(u.id));

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  console.log(typeof user.id);
  console.log(typeof parseInt(cookieData.userId));


  if (user.id !== parseInt(cookieData.userId)) {
    return res.status(401).sendFile(path.join(__dirname, 'public', 'its-ok-at-least-you-tried.jpg'));
  }

  next();
}



// Route to get Card details by User ID
app.get('/cardData/users', authorize, (req, res) => {
  const id = req.query.id;
  console.log("Route ids are:", id);
  console.log(req.query.id);

  const users = cardData.find(u => id.includes(u.id));

  if (users.id !== 1) {
    res.set('flag', 'helcim{Decode_The_Cookie}');
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
