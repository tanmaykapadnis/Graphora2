const express = require('express');
const app = express();
const PORT = 4000;

// fetch + readability imports
const fetchFunc = (typeof fetch === 'function')
  ? fetch
  : (...args) => import('node-fetch').then(m => m.default(...args));
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

app.get('/', (req, res) => {
  res.send('Server running');
});

// helper function
async function fetchArticleText(url) {
  const resp = await fetchFunc(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await resp.text();
  const dom = new JSDOM(html, { url });
  const article = new Readability(dom.window.document).parse();
  return article?.textContent?.trim() || article?.excerpt?.trim() || '';
}

// NEW route
app.get('/test-extract', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send('Provide ?url=...');

    const text = await fetchArticleText(url);
    res.json({
      ok: true,
      snippet: text.slice(0, 500)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
