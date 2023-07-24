const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


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
app.post('/login',  (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Perform authentication logic
  if (username === 'barry' && password === 'barry123') {
    // Authentication successful
    const authenticatedUser = {
      id: 1 // Assuming user with ID 1 is authenticated
    };
    req.session.user = authenticatedUser; // Store user object in session
   
  
  res.redirect('/profile.html');
  
  
  }
  
   else {
    // Authentication failed
    res.send('Invalid credentials');
  }
});

// Assuming you are already authenticated as Barry Allen.

// Array to store user data (In a real application, this should be replaced with a database)
let cardData= [
  { id: 1, name: 'Barry Allen',Card_Number:5413330089099130, Expiry_date: '01/25', CVV: '100' },
  { id: 2, name: 'Alex',Card_Number:5413330089020011, Expiry_date: '01/25', CVV: '101' },
  {id: 3, name: 'Mandeep',Card_Number:5413334579020011, Expiry_date: '01/25', CVV: '102'},
  {id: 4, name: 'Prashant',Card_Number:5413330123020011, Expiry_date: '01/25', CVV: '103'}
];

// Authorization middleware
function authorize(req, res, next) {
  const userId = req.session.user?.id;
  const id = req.params.id.split(',').map(Number);
  const user = cardData.find(u => id.includes(u.id));
  req.authorize= user;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  console.log(user.id);
  if (user.id !== userId) {
    
    return res.status(401).sendFile(path.join(__dirname, 'public', 'its-ok-at-least-you-tried.jpg'));
  }
 // res.set('flag','helcim{Yeah-You-Got-This-One}');
  next();
}




// Route to get Card details by User ID
app.get('/cardData/users/:id',authorize, (req, res) => {
  const userId = req.session.user?.id;
  if (userId)
   {
  const id = parseInt(req.params.id);
  console.log("Route id is:", id);
  console.log(req.params.id);
  const user = cardData.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (user.id !== 1 )
  {
    res.set('flag','helcim{Kudos_To_Code_Review}');
  }
  res.json(user);
  console.log(user);
  }
  else {
    res.status(401).send("Login First"); // Send 401 Unauthorized status code for unauthenticated requests
  }

});


 
// Route to update user details by ID
app.post('/cardData/users/:id', authorize, (req, res) => {
  

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
