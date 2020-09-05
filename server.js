import express from 'express';
import { getSingleKanji } from './src/getKanji';
import { getSingleWord } from './src/getWord';

const app = express();

app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// app.get('/test', (_, res) => res.send('<div><p>Hello</p><h1>world</h1></div>'));
app.get('/kanji', async (req, res) => {
  const { kanji_alive_api_key: kanjiAliveApiKey } = req.headers;
  const { word, allowRefetch, handleAsWord } = req.query;

  const options = {
    kanjiAliveApiKey,
    allowRefetch,
    handleAsWord,
  };

  try {
    const body = await getSingleKanji(options, word);
    res.json(body);
  } catch (err) {
    res.status(500).json({ type: 'error', message: err.message });
  }
});

app.get('/word', async (req, res) => {
  const { word, allowRefetch, handleAsWord } = req.query;

  const options = {
    allowRefetch,
    handleAsWord,
  };

  try {
    const body = await getSingleWord(options, word);
    res.json(body);
  } catch (err) {
    res.status(500).json({ type: 'error', message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
