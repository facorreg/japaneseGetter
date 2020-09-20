/* eslint-disable consistent-return */
import express from 'express';
import isArray from 'lodash/isArray';
import { getSingleKanji, getKanjiList } from './src/getKanji';
import { getSingleWord, getWordReadings, getWordTraductions } from './src/getWord';
import getCorpus from './src/getCorpus';
import { getEnv } from './src/utils';
import {
  build, importTatoebaCorpus, cleanSlate, createESClient,
} from './src/elastic';
import log from './src/logs';

const esClient = createESClient();

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

app.get('/es/build', async (_, res) => {
  if (!esClient) return res.status(200).json({ status: 'ES missing' });

  try {
    await build(esClient);
    res.status(200).json({ status: 'ES built' });
  } catch (err) {
    log(err);
    res.status(500).json({ error: err });
  }
});

app.get('/es/importTatoebaCorpus', async (_, res) => {
  try {
    await importTatoebaCorpus(esClient);
    res.status(200).json({ status: 'Import successful' });
  } catch (err) {
    log(err);
    res.status(500).json({ error: err });
  }
});

app.get('/es/cleanSlate', async (_, res) => {
  try {
    await cleanSlate(esClient);
    res.status(200).json({ status: 'Index deleted' });
  } catch (err) {
    log(err);
    res.status(500).json({ error: err });
  }
});

app.get('/examples', async (req, res) => {
  const { list } = req.query;
  try {
    const data = await Promise.all(
      JSON.parse(list)
        .map(({ jpList, enList, pos }) => getCorpus({
          ...req.query, esClient, jpList, enList, pos,
        })),
    );
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ type: 'error', message: err.message });
  }
});

app.get('/example', async (req, res) => {
  const { japaneseList, englishList } = req.query;

  try {
    const arrayIze = (el) => (isArray(el) ? el : [el]);
    const body = await getCorpus({
      ...req.query, esClient, jpList: arrayIze(japaneseList), enList: arrayIze(englishList),
    });
    res.status(200).json(body);
  } catch (err) {
    res.status(500).json({ type: 'error', message: err.message });
  }
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
  const { kanjiArray, allowRefetch, handleAsWord } = req.query;

  const options = {
    allowRefetch,
    handleAsWord,
  };

  try {
    const body = await getKanjiList(options, (isArray(kanjiArray) ? kanjiArray : [kanjiArray]));
    res.json(body);
  } catch (err) {
    res.status(500).json({ type: 'error', message: err.message });
  }
});

app.get('/word/readings', async (req, res) => {
  const { word } = req.query;

  try {
    const body = await getWordReadings({}, word);
    res.json(body);
  } catch (err) {
    res.status(500).json({ type: 'error', message: err.message });
  }
});

app.get('/word/traductions', async (req, res) => {
  const { word } = req.query;

  try {
    const body = await getWordTraductions({}, word);
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
