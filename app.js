const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3001;

app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));

const messages = [
  {
    text: 'Hi there!',
    user: 'Amando',
    added: new Date(),
  },
  {
    text: 'Hello World!',
    user: 'Charles',
    added: new Date(),
  },
];

app.get('/', (req, res) => {
  res.render('index', { title: 'Mini Messageboard', messages });
});

app.get('/new', (req, res) => {
  res.render('form', { title: 'New Message' });
});

app.post('/new', (req, res) => {
  const { messageText, messageUser } = req.body;
  messages.push({ text: messageText, user: messageUser, added: new Date() });
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
module.exports = app;
