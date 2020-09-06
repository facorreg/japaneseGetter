import express from 'express';
import http from 'http';
import isArray from 'lodash/isArray';
import { getSingleKanji, getKanjiList } from './src/getKanji';
import { getSingleWord } from './src/getWord';
import { getEnv } from './src/utils';

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  req.query = Object.keys(req.query)
    .reduce((acc, key) => ({
      ...acc,
      [key]: !isArray(req.query[key])
        ? decodeURIComponent(req.query[key])
        : req.query[key].map((q) => decodeURIComponent(q)),
    }), {});
  next();
});

app.get('/kanji', async (req, res) => {
  const { kanji_alive_api_key: kanjiAliveApiKey } = req.headers;
  const { kanji, allowRefetch, handleAsWord } = req.query;

  const options = {
    kanjiAliveApiKey,
    allowRefetch,
    handleAsWord,
  };

  try {
    const body = await getSingleKanji(options, kanji);
    res.json(body);
  } catch (err) {
    res.status(500).json({ type: 'error', message: err.message });
  }
});

app.get('/kanjiList', async (req, res) => {
  const { kanji_alive_api_key: kanjiAliveApiKey } = req.headers;
  const { kanjiArray, allowRefetch, handleAsWord } = req.query;

  const options = {
    kanjiAliveApiKey,
    allowRefetch,
    handleAsWord,
  };

  try {
    const body = await getKanjiList(options, kanjiArray);
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

const PORT = getEnv('PORT', 3000);
// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`listening on ${PORT}`));

const ENV = getEnv('ENV');

if (ENV === 'prod') {
  setInterval(() => {
    http.get(`http://${getEnv('PROJECT_DOMAIN', '')}.glitch.me/`);
  }, 280000);
}