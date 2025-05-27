require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const sequelize = require('./db');
const View = require('./models/View');

const app = express();
const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => console.log('Connected to MySQL'))
  .catch(err => console.error('Unable to connect:', err));

sequelize.sync();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/news', async (req, res) => {
  try {
    const { q, category } = req.query;
    const endpoint = q
      ? 'https://newsapi.org/v2/everything'
      : 'https://newsapi.org/v2/top-headlines';

    const params = {
      apiKey: process.env.NEWS_API_KEY,
      language: 'en',
      ...(q && { q }),
      ...(category && { category }),
      ...(category === '' && { country: 'in' })
    };

    const response = await axios.get(endpoint, { params });
    res.json(response.data);
  } catch (error) {
    console.error('News API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error fetching news' });
  }
});

app.get('/', async (req, res) => {
  await View.create({});
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
