const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3002;

app.use(express.static('public'));

app.get('/api/topics', (_, res) => {
  const dataPath = path.join(__dirname, 'data');
  fs.readdir(dataPath, (err, files) => {
    if (err) return res.status(500).json({ error: 'Error during data directory access' });

    const topics = [];
    files.filter(f => f.endsWith('.json')).forEach(file => {
      const filePath = path.join(dataPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const json = JSON.parse(content);
      topics.push({
        id: file.replace('.json', ''),
        title: json.title,
        description: json.description
      });
    });
    res.json(topics);
  });
});

app.get('/api/topics/:id', (req, res) => {
  const file = path.join(__dirname, 'data', `${req.params.id}.json`);
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    res.json(JSON.parse(content));
  } else {
    res.status(404).json({ error: 'Topic not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Web server listening on http://localhost:${PORT}`);
});
