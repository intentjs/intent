import { Str } from './string.js';

function revertCase(word: string, token: string) {
  if (Str.equals(word, token)) return token;

  if (Str.isLowerCase(word)) return Str.lower(token);

  if (Str.isUpperCase(word)) return Str.upper(token);

  if (word[0] === Str.upper(word[0])) {
    return Str.ucfirst(token);
  }

  return Str.lower(token);
}

const irregularPulurals = {
  I: 'we',
  me: 'us',
  he: 'they',
  she: 'they',
  them: 'them',
  myself: 'ourselves',
  yourself: 'yourselves',
  itself: 'themselves',
  herself: 'themselves',
  himself: 'themselves',
  themself: 'themselves',
  is: 'are',
  was: 'were',
  has: 'have',
  this: 'these',
  that: 'those',
  my: 'our',
  its: 'their',
  his: 'their',
  her: 'their',
  echo: 'echoes',
  dingo: 'dingoes',
  volcano: 'volcanoes',
  tornado: 'tornadoes',
  torpedo: 'torpedoes',
  genus: 'genera',
  viscus: 'viscera',
  stigma: 'stigmata',
  stoma: 'stomata',
  dogma: 'dogmata',
  lemma: 'lemmata',
  schema: 'schemata',
  anathema: 'anathemata',
  ox: 'oxen',
  axe: 'axes',
  die: 'dice',
  yes: 'yeses',
  foot: 'feet',
  eave: 'eaves',
  goose: 'geese',
  tooth: 'teeth',
  quiz: 'quizzes',
  human: 'humans',
  proof: 'proofs',
  carve: 'carves',
  valve: 'valves',
  looey: 'looies',
  thief: 'thieves',
  groove: 'grooves',
  pickaxe: 'pickaxes',
  passerby: 'passersby',
  canvas: 'canvases',
};

const irregularSingulars = {
  we: 'I',
  us: 'me',
  they: 'he',
  them: 'them',
  ourselves: 'myself',
  yourselves: 'yourself',
  themselves: 'themself',
  are: 'is',
  were: 'was',
  have: 'has',
  these: 'this',
  those: 'that',
  our: 'my',
  their: 'his',
  echoes: 'echo',
  dingoes: 'dingo',
  volcanoes: 'volcano',
  tornadoes: 'tornado',
  torpedoes: 'torpedo',
  genera: 'genus',
  viscera: 'viscus',
  stigmata: 'stigma',
  stomata: 'stoma',
  dogmata: 'dogma',
  lemmata: 'lemma',
  schemata: 'schema',
  anathemata: 'anathema',
  oxen: 'ox',
  axes: 'axe',
  dice: 'die',
  yeses: 'yes',
  feet: 'foot',
  eaves: 'eave',
  geese: 'goose',
  teeth: 'tooth',
  quizzes: 'quiz',
  humans: 'human',
  proofs: 'proof',
  carves: 'carve',
  valves: 'valve',
  looies: 'looey',
  thieves: 'thief',
  grooves: 'groove',
  pickaxes: 'pickaxe',
  passersby: 'passerby',
  canvases: 'canvas',
};

const uncountableWords = {
  adulthood: true,
  advice: true,
  agenda: true,
  aid: true,
  aircraft: true,
  alcohol: true,
  ammo: true,
  analytics: true,
  anime: true,
  athletics: true,
  audio: true,
  bison: true,
  blood: true,
  bream: true,
  buffalo: true,
  butter: true,
  carp: true,
  cash: true,
  chassis: true,
  chess: true,
  clothing: true,
  cod: true,
  commerce: true,
  cooperation: true,
  corps: true,
  debris: true,
  diabetes: true,
  digestion: true,
  elk: true,
  energy: true,
  equipment: true,
  excretion: true,
  expertise: true,
  firmware: true,
  flounder: true,
  fun: true,
  gallows: true,
  garbage: true,
  graffiti: true,
  hardware: true,
  headquarters: true,
  health: true,
  herpes: true,
  highjinks: true,
  homework: true,
  housework: true,
  information: true,
  jeans: true,
  justice: true,
  kudos: true,
  labour: true,
  literature: true,
  machinery: true,
  mackerel: true,
  mail: true,
  media: true,
  mews: true,
  moose: true,
  music: true,
  mud: true,
  manga: true,
  news: true,
  only: true,
  personnel: true,
  pike: true,
  plankton: true,
  pliers: true,
  police: true,
  pollution: true,
  premises: true,
  rain: true,
  research: true,
  rice: true,
  salmon: true,
  scissors: true,
  series: true,
  sewage: true,
  shambles: true,
  shrimp: true,
  software: true,
  staff: true,
  swine: true,
  tennis: true,
  traffic: true,
  transportation: true,
  trout: true,
  tuna: true,
  wealth: true,
  welfare: true,
  whiting: true,
  wildebeest: true,
  wildlife: true,
  you: true,
};

const singularRules = [
  [/s$/i, ''],
  [/(ss)$/i, '$1'],
  [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'],
  [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, '$1f'],
  [/ies$/i, 'y'],
  [/(dg|ss|ois|lk|ok|wn|mb|th|ch|ec|oal|is|ck|ix|sser|ts|wb)ies$/i, '$1ie'],
  [
    /\b(l|(?:neck|cross|hog|aun)?t|coll|faer|food|gen|goon|group|hipp|junk|vegg|(?:pork)?p|charl|calor|cut)ies$/i,
    '$1ie',
  ],
  [/\b(mon|smil)ies$/i, '$1ey'],
  [/\b((?:tit)?m|l)ice$/i, '$1ouse'],
  [/(seraph|cherub)im$/i, '$1'],
  [
    /(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i,
    '$1',
  ],
  [
    /(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i,
    '$1sis',
  ],
  [/(movie|twelve|abuse|e[mn]u)s$/i, '$1'],
  [/(test)(?:is|es)$/i, '$1is'],
  [
    /(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i,
    '$1us',
  ],
  [
    /(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i,
    '$1um',
  ],
  [
    /(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i,
    '$1on',
  ],
  [/(alumn|alg|vertebr)ae$/i, '$1a'],
  [/(cod|mur|sil|vert|ind)ices$/i, '$1ex'],
  [/(matr|append)ices$/i, '$1ix'],
  [/(pe)(rson|ople)$/i, '$1rson'],
  [/(child)ren$/i, '$1'],
  [/(eau)x?$/i, '$1'],
  [/men$/i, 'man'],

  [/pok[eé]mon$/i, '$0'],
  [/[^aeiou]ese$/i, '$0'],
  [/deer$/i, '$0'],
  [/fish$/i, '$0'],
  [/measles$/i, '$0'],
  [/o[iu]s$/i, '$0'],
  [/pox$/i, '$0'],
  [/sheep$/i, '$0'],
];

const pluralRules = [
  [/s?$/i, 's'],
  [/[^\u0000-\u007F]$/i, '$0'],
  [/([^aeiou]ese)$/i, '$1'],
  [/(ax|test)is$/i, '$1es'],
  [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, '$1es'],
  [/(e[mn]u)s?$/i, '$1s'],
  [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, '$1'],
  [
    /(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i,
    '$1i',
  ],
  [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae'],
  [/(seraph|cherub)(?:im)?$/i, '$1im'],
  [/(her|at|gr)o$/i, '$1oes'],
  [
    /(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i,
    '$1a',
  ],
  [
    /(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i,
    '$1a',
  ],
  [/sis$/i, 'ses'],
  [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves'],
  [/([^aeiouy]|qu)y$/i, '$1ies'],
  [/([^ch][ieo][ln])ey$/i, '$1ies'],
  [/(x|ch|ss|sh|zz)$/i, '$1es'],
  [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices'],
  [/\b((?:tit)?m|l)(?:ice|ouse)$/i, '$1ice'],
  [/(pe)(?:rson|ople)$/i, '$1ople'],
  [/(child)(?:ren)?$/i, '$1ren'],
  [/eaux$/i, '$0'],
  [/m[ae]n$/i, 'men'],
  ['thou', 'you'],
  [/pok[eé]mon$/i, '$0'],
  [/[^aeiou]ese$/i, '$0'],
  [/deer$/i, '$0'],
  [/fish$/i, '$0'],
  [/measles$/i, '$0'],
  [/o[iu]s$/i, '$0'],
  [/pox$/i, '$0'],
  [/sheep$/i, '$0'],
];

const sanitizeWord = (token: string, word: string, rules: object[]) => {
  if (!token.length || uncountableWords.hasOwnProperty(token)) {
    return word;
  }

  let len = rules.length;

  while (len--) {
    const rule = rules[len];
    if (new RegExp(rule[0]).test(word)) return replace(word, rule);
  }

  return word;
};

const interpolate = (str: string, args) => {
  return str.replace(/\$(\d{1,2})/g, function (match, index) {
    return args[index] || '';
  });
};

const replace = (word: string, rule: object) => {
  return word.replace(rule[0], function (match, index) {
    const result = interpolate(rule[1], arguments);
    if (match === '') {
      return revertCase(word[index - 1], result);
    }

    return revertCase(match, result);
  });
};

export const pluralize = (word: string) => {
  const token = Str.lower(word);

  if (irregularPulurals.hasOwnProperty(token)) {
    return revertCase(word, token);
  }

  if (irregularSingulars.hasOwnProperty(token)) {
    return revertCase(word, irregularSingulars[token]);
  }
  return sanitizeWord(token, word, pluralRules);
};

export const singularize = (word: string) => {
  const token = Str.lower(word);

  if (irregularSingulars.hasOwnProperty(token)) {
    return revertCase(word, token);
  }

  if (irregularPulurals.hasOwnProperty(token)) {
    return revertCase(word, irregularPulurals[token]);
  }

  return sanitizeWord(token, word, singularRules);
};
