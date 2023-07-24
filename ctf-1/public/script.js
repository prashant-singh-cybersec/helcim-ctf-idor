// Fetch the JSON data from the server
fetch('/cardData/users/1')
  .then(response => response.json())
  .then(userData => {
    // Render the EJS template with the JSON data
    const template = document.getElementById('profile-template').innerHTML;
    const renderedHtml = ejs.render(template, { user: userData });
    document.getElementById('profile-container').innerHTML = renderedHtml;
  })
  .catch(error => {
    console.error('An error occurred:', error);
  });
