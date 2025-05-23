import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;
const dataPath = path.join(process.cwd(), 'data', 'proverbs.json');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Load data from file
function loadProverbs() {
  if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, '[]');
  const data = fs.readFileSync(dataPath);
  return JSON.parse(data);
}

// Save data to file
function saveProverbs(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Generate a simple unique ID (just an incrementing integer)
function generateUniqueId(proverbs) {
  return proverbs.length ? proverbs[proverbs.length - 1].id + 1 : 1;
}

// Homepage - list all proverbs
app.get('/', (req, res) => {
  let proverbs = loadProverbs();
  const { category, search } = req.query;

  if (category) {
    proverbs = proverbs.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const lower = search.toLowerCase();
    proverbs = proverbs.filter(p =>
      p.textDari.toLowerCase().includes(lower) ||
      p.textPashto.toLowerCase().includes(lower) ||
      p.translationEn.toLowerCase().includes(lower)
    );
  }

  res.render('index', { proverbs });
});

// Get all proverbs
app.get('/proverbs', (req, res) => {
  let proverbs = loadProverbs();
  const { category, search } = req.query;

  if (category) {
    proverbs = proverbs.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const lower = search.toLowerCase();
    proverbs = proverbs.filter(p =>
      p.textDari.toLowerCase().includes(lower) ||
      p.textPashto.toLowerCase().includes(lower) ||
      p.translationEn.toLowerCase().includes(lower)
    );
  }

  res.render('index', { proverbs });
});

// Get random proverb
app.get('/proverbs/random', (req, res) => {
  const proverbs = loadProverbs();
  const random = proverbs[Math.floor(Math.random() * proverbs.length)];
  res.render('show', { proverb: random });
});

// Show form to add a new proverb
app.get('/proverbs/new', (req, res) => {
  res.render('form', { proverb: null });
});

// Get a single proverb by ID
app.get('/proverbs/:id', (req, res) => {
  const proverb = loadProverbs().find(p => p.id === parseInt(req.params.id));
  if (!proverb) return res.status(404).send('Proverb not found');
  res.render('show', { proverb });
});

// Create a new proverb
app.post('/proverbs', (req, res) => {
  const proverbs = loadProverbs();
  const { textDari, textPashto, translationEn, meaning, category } = req.body;

  if (!textDari || !textPashto || !translationEn || !meaning || !category) {
    return res.status(400).send('All fields are required.');
  }

  const newProverb = {
    id: generateUniqueId(proverbs),
    textDari,
    textPashto,
    translationEn,
    meaning,
    category
  };

  proverbs.push(newProverb);
  saveProverbs(proverbs);
  res.redirect('/');
});

// Show edit form
app.get('/proverbs/:id/edit', (req, res) => {
  const proverb = loadProverbs().find(p => p.id === parseInt(req.params.id));
  if (!proverb) return res.status(404).send('Proverb not found');
  res.render('form', { proverb });
});

// Update an existing proverb
app.post('/proverbs/:id', (req, res) => {
  const proverbs = loadProverbs();
  const index = proverbs.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).send('Not found');

  const { textDari, textPashto, translationEn, meaning, category } = req.body;
  if (!textDari || !textPashto || !translationEn || !meaning || !category) {
    return res.status(400).send('All fields are required.');
  }

  proverbs[index] = {
    id: parseInt(req.params.id),
    textDari,
    textPashto,
    translationEn,
    meaning,
    category
  };

  saveProverbs(proverbs);
  res.redirect('/proverbs/' + req.params.id);
});

// Delete a proverb
app.post('/proverbs/:id/delete', (req, res) => {
  let proverbs = loadProverbs();
  proverbs = proverbs.filter(p => p.id !== parseInt(req.params.id));
  saveProverbs(proverbs);
  res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
