const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/liveops', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const offerSchema = new mongoose.Schema({
  title: String,
  description: String,
});

const Offer = mongoose.model('Offer', offerSchema);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

app.get('/api/offers', (req, res) => {
  Offer.find({}, (err, offers) => {
    if (err) {
      res.status(500).json({ error: 'An error occurred while retrieving offers' });
    } else {
      res.json(offers);
    }
  });
});

app.get('/api/offers/:id', (req, res) => {
  const offerId = req.params.id;

  Offer.findById(offerId, (err, offer) => {
    if (err) {
      res.status(500).json({ error: 'An error occurred while retrieving the offer' });
    } else if (!offer) {
      res.status(404).json({ error: 'Offer not found' });
    } else {
      res.json(offer);
    }
  });
});

app.post('/api/offers', (req, res) => {
  const newOffer = req.body;

  Offer.create(newOffer, (err, offer) => {
    if (err) {
      res.status(500).json({ error: 'An error occurred while creating the offer' });
    } else {
      res.status(201).json(offer);
    }
  });
});

app.put('/api/offers/:id', (req, res) => {
  const offerId = req.params.id;
  const updatedOffer = req.body;

  Offer.findByIdAndUpdate(offerId, updatedOffer, (err, offer) => {
    if (err) {
      res.status(500).json({ error: 'An error occurred while updating the offer' });
    } else if (!offer) {
      res.status(404).json({ error: 'Offer not found' });
    } else {
      res.json(offer);
    }
  });
});

app.delete('/api/offers/:id', (req, res) => {
  const offerId = req.params.id;

  Offer.findByIdAndDelete(offerId, (err, offer) => {
    if (err) {
      res.status(500).json({ error: 'An error occurred while deleting the offer' });
    } else if (!offer) {
      res.status(404).json({ error: 'Offer not found' });
    } else {
      res.json({ message: 'Offer deleted successfully' });
    }
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username }, (err, user) => {
    if (err) {
      res.status(500).json({ error: 'An error occurred while logging in' });
    } else if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
    } else {
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          const token = jwt.sign({ username: user.username }, 'secret-key', { expiresIn: '1h' });
          res.json({ token });
        } else {
          res.status(401).json({ error: 'Invalid username or password' });
        }
      });
    }
  });
});

function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    jwt.verify(token, 'secret-key', (err, decoded) => {
      if (err) {
        res.status(401).json({ error: 'Invalid token' });
      } else {
        req.user = decoded.username;
        next();
      }
    });
  }
}

app.get('/api/user', verifyToken, (req, res) => {
  const username = req.user;
  res.json({ username });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});