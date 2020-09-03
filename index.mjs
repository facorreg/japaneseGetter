import express from 'express';
import request from 'request';
import getEnv from './src/utils/getEnv';

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/words/:word', (req, res) => {
  request(
    { url: `${getEnv('JISHO_URL', '')}?keyword=${req.params.word}` },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: error.message });
      }

      return res.json(JSON.parse(body));
    },
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
