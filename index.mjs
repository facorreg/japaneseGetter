import express from 'express';
import fetchAPIs from './src/api/fetchAPIs';

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.post('/words', async (req, res) => {
  const { kanji_live_api_key: kanjiLiveApiKey } = req.headers;
  const { word, allowRefetch, handleAsWord } = req.query;

  const options = {
    kanjiLiveApiKey,
    allowRefetch,
    handleAsWord,
  };

  const args = { word };

  try {
    const body = await fetchAPIs(options, args);
    res.json(body);
  } catch (err) {
    res.status(500).json({ type: 'error', message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
