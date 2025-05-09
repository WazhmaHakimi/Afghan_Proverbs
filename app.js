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
  return proverbs.length ? proverbs[proverbs.length - 1].id + 1 : 1; // Start with 1
}

// Home - list all proverbs
app.get('/', (req, res) => {
  let proverbs = loadProverbs();
  const category = req.query.category;
  const search = req.query.search;

  // Filter by category
  if (category) {
    proverbs = proverbs.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Search by any language
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

app.get('/proverbs', (req, res) => {
  let proverbs = loadProverbs();
  const category = req.query.category;
  const search = req.query.search;

  // Filter by category
  if (category) {
    proverbs = proverbs.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Search by any language
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

// Random proverb
app.get('/proverbs/random', (req, res) => {
  const proverbs = loadProverbs();
  const random = proverbs[Math.floor(Math.random() * proverbs.length)];
  res.json(random);
});

// Form to create a new proverb
app.get('/proverbs/new', (req, res) => {
  res.render('form', { proverb: null });
});

// Get a single proverb by ID
app.get('/proverbs/:id', (req, res) => {
  const proverb = loadProverbs().find(p => p.id === parseInt(req.params.id)); // Use parseInt to match the ID correctly
  if (!proverb) return res.status(404).send('Proverb not found');
  res.render('show', { proverb });
});

// Create a new proverb
app.post('/proverbs', (req, res) => {
  const proverbs = loadProverbs();
  const newProverb = {
    id: generateUniqueId(proverbs), // Generate a simple incremental ID
    textDari: req.body.textDari,
    textPashto: req.body.textPashto,
    translationEn: req.body.translationEn,
    meaning: req.body.meaning,
    category: req.body.category
  };
  proverbs.push(newProverb);
  saveProverbs(proverbs);
  res.redirect('/proverbs');
});

// Form to edit an existing proverb
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

  proverbs[index] = {
    id: parseInt(req.params.id),
    textDari: req.body.textDari,
    textPashto: req.body.textPashto,
    translationEn: req.body.translationEn,
    meaning: req.body.meaning,
    category: req.body.category
  };

  saveProverbs(proverbs);
  res.redirect('/proverbs/' + req.params.id);
});

// Delete a proverb
app.post('/proverbs/:id/delete', (req, res) => {
  let proverbs = loadProverbs();
  proverbs = proverbs.filter(p => p.id !== parseInt(req.params.id));
  saveProverbs(proverbs);
  res.redirect('/proverbs');
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
