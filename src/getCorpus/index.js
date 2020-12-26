import get from 'lodash/get';
import once from 'lodash/once';
import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import RegexEscape from 'regex-escape';
import { flattenDeep } from 'lodash';
import { search } from '../elastic';
import { hasKanji, rejectError, getEnv } from '../utils';
import {
  partOfSpeech,
  conjugatedTypes,
  conjugatedForms,
} from './jpTokens';

const getQuery = (lists) => {
  const specificProps = {
    en: [{
      auto_generate_synonyms_phrase_query: true,
      default_field: 'en',
      default_operator: 'AND',
      boost: 2,
    }, {
      auto_generate_synonyms_phrase_query: true,
      default_field: 'en.ngram',
      minimum_should_match: '80%',
    }],
    jp: [{
      default_field: 'jp',
      boost: 2,
    }, {
      default_field: 'jp.baseform',
      boost: 1.25,
    }],
  };

  return ({
    bool: {
      must: Object.keys(lists).map((key) => ({
        bool: {
          should: specificProps[key].map(({ ...props }) => ({
            query_string: {
              query: lists[key].join(' '),

              // query: type === 'query'
              // ? lists[key].join(' AND ')
              // : lists[key].join(' OR '),
              ...props,
            },
          })),
        },
      })),
    },
  });
};

const getSingleCorpus = async (args) => {
  const {
    esClient,
    jpList,
    enList,
    from = 0,
    size = 1,
    pos,
    maxRetry = 1,
  } = args;
  let query;

  try {
    query = {
      index: getEnv('CORPUS_ES_INDEX', 'tatoeba'),
      from,
      size,
      body: { query: getQuery({ en: enList, jp: jpList }) },
    };

    // console.log(JSON.stringify(getQuery({ en: enList, jp: jpList }), null, 2));
    const res = await search(esClient, query);
    const hits = get(res, 'body.hits.hits', [])
      .map(({ _source: source }) => ({ ...source, pos }));
    const filtered = hits;

    const found = hits.length; // && filtered.length;
    const remainingToFind = size - filtered.length;
    const shouldRecurs = (!found || remainingToFind) && maxRetry > 1;

    const complementaryResults = shouldRecurs
      ? (await getSingleCorpus({ ...args, from: hits.length, maxRetry: maxRetry - 1 }))
      : [];

    return Promise.resolve([...filtered, ...complementaryResults]);
  } catch (err) {
    // console.log(JSON.stringify(query, null, 2));
    return rejectError('Failed to get examples because ', err);
  }
};

const getCorpus = async ({ enList, ...rest }) => {
  const corpuses = await Promise.all(
    enList.map(async (enQuery) => getSingleCorpus({ ...rest, enList: [enQuery] })),
  );
  return flatten(corpuses).filter((e) => e);
};

// const getJpVals = (jpReg) => (jpReg.match(/([ぁ-んァ-ン一-龥]+)/g) || []);

const getJpTokens = (jpList, tokenizer) => {
  // console.log(jpList);
  const tokens = jpList.map((jp) => tokenizer.tokenize(jp[0]).map(({
    basic_form: bf,
    surface_form: sf,
  }) => ([bf, sf])));

  return flattenDeep(tokens);
};

const corpusWithGrammar = async ({ tokenizerPromise, jpList, ...rest }) => {
  const tokenizer = await tokenizerPromise;
  // buildJpRegexp(rest.jpList, tokenizer);
  // return [];
  const corpus = await getCorpus({ ...rest, jpList: getJpTokens(jpList, tokenizer) });

  const extractor = {
    furigana: { reg: /\(([^)]+)\)/ },
    realUse: { reg: /\{([^)]+)\}/ },
    str: {
      reg: /\[[0-9]+\]|\|[0-9]+|~|～/g,
      keepReplaced: true,
    },
  };

  const jpParsed = (str) => (
    str.split(' ').map((d) => (
      Object.keys(extractor).reduce((acc, key) => {
        const { reg, keepReplaced } = extractor[key];
        const matched = d.match(reg);
        if (!matched) return acc;

        const replaced = acc.str.replace(matched[0], '');
        return {
          str: replaced,
          obj: { ...acc.obj, [key]: keepReplaced ? replaced : matched[1] },
        };
      }, { str: d, obj: {} })
    )));

  const buildJapaneseEx = (jp) => (
    jpParsed(jp).reduce((acc, { str, obj }) => {
      const use = obj.realUse || obj.str || str;
      return `${acc}${use}`;
    }, ''));

  /*
      do not mistake pos (position) for pos (part of speech)
    */

  const sentenceTokens = corpus.map(({ jp, en, pos: position }) => ({
    pos: position,
    en,
    tokens: tokenizer.tokenize(buildJapaneseEx(jp)).map(({
      pos,
      pos_detail_1: posDetail1,
      pos_detail_2: posDetail2,
      pos_detail_3: posDetail3,
      conjugated_type: ct,
      conjugated_form: cf,
      surface_form: sf,
      basic_form: bf,
      word_id: wId,
      word_type: wt,
      word_position: wp,
      ...tokens
    }) => ({
      pos: partOfSpeech[pos] || pos,
      posDetail1: partOfSpeech[posDetail1] || posDetail1,
      posDetail2: partOfSpeech[posDetail2] || posDetail2,
      posDetail3: partOfSpeech[posDetail3] || posDetail3,
      conjugatedType: conjugatedTypes[ct] || ct,
      conjugatedForm: conjugatedForms[cf] || cf,
      surfaceForm: sf,
      basicForm: bf,
      wordId: wId,
      wordType: wt,
      word_position: wp,
      ...tokens,
    })),
  }));

  return sentenceTokens;
};

export default corpusWithGrammar;
