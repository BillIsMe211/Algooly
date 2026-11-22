const JUDGE_URLS = [
  [/^(?:www\.)?codeforces\.com$/i, 'Codeforces'],
  [/^(?:www\.)?atcoder\.jp$/i, 'AtCoder'],
  [/^(?:www\.)?leetcode\.com$/i, 'LeetCode'],
  [/^(?:www\.)?cses\.fi$/i, 'CSES'],
  [/^(?:www\.)?hackerrank\.com$/i, 'HackerRank'],
  [/^(?:www\.)?spoj\.com$/i, 'SPOJ'],
  [/^(?:www\.)?luogu\.com\.cn$/i, 'Luogu'],
  [/^(?:www\.)?(?:oj\.)?vnoi\.info$/i, 'VNOI'],
  [/^(?:www\.)?codechef\.com$/i, 'CodeChef'],
  [/^(?:www\.)?open\.kattis\.com$/i, 'Kattis'],
  [/^(?:www\.)?dmoj\.ca$/i, 'DMOJ'],
  [/^(?:www\.)?usaco\.org$/i, 'USACO'],
  [/^(?:www\.)?topcoder\.com$/i, 'Topcoder'],
  [/^(?:www\.)?hackerearth\.com$/i, 'HackerEarth'],
  [/^(?:www\.)?marisaoj\.com$/i, 'MarisaOJ'],
  [/^(?:www\.)?clue\.edu\.vn$/i, 'ClueOJ'],
  [/^(?:www\.)?(?:[^.]+\.)*clue\.edu\.vn$/i, 'ClueOJ']
];

function cleanProblemUrl(value) {
  const text = String(value || '').trim().replace(/[),.;!?}\]]+$/, '');
  try {
    const url = new URL(text);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || !url.hostname.includes('.')) return '';
    return url.href;
  } catch (error) { return ''; }
}

function judgeFromUrl(value) {
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, '');
    const match = JUDGE_URLS.find(([pattern]) => pattern.test(host));
    return match ? match[1] : '';
  } catch (error) { return ''; }
}

function problemIdFromUrl(value) {
  try {
    const url = new URL(value), host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host !== 'codeforces.com') return '';
    const match = /^\/(?:problemset\/problem\/(\d+)\/([A-Z]\d*)|contest\/(\d+)\/problem\/([A-Z]\d*))\/?$/i.exec(url.pathname);
    return match ? `${match[1] || match[3]}${(match[2] || match[4]).toUpperCase()}` : '';
  } catch (error) { return ''; }
}

function judgeFromText(value) {
  const text = String(value || '');
  if (/\bmarisa\s*(?:online\s*)?oj\b|\bmarisa\s+online\s+judge\b|\bmarisaoj\b/i.test(text)) return 'MarisaOJ';
  if (/\bclue\s*(?:online\s*)?(?:oj|judge)\b|\bclueoj\b|\boj\.clue\.edu\.vn\b/i.test(text)) return 'ClueOJ';
  const known = JUDGE_URLS.map(entry => entry[1]).concat(['Leet Code', 'CF']);
  const aliases = { 'Leet Code': 'LeetCode', CF: 'Codeforces' };
  for (const name of known) {
    const pattern = name === 'CF' ? /\bCF\b/i : new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(text)) return aliases[name] || name;
  }
  if (/\b(?:online judge|oj unknown|unknown judge)\b/i.test(text)) return 'Unknown';
  return '';
}

function inferJudge(site, urls, pid, tags, context, title) {
  for (const value of Array.isArray(urls) ? urls : []) {
    const judge = judgeFromUrl(value);
    if (judge) return judge;
  }
  const named = judgeFromText(site);
  if (named) return named;
  const id = String(pid || '').trim();
  if (/^(?:CF[-\s:]*)?\d+\s*[-/]?\s*[A-Z]\d*$/i.test(id)) return 'Codeforces';
  if (/^(?:abc|arc|agc|typical90|dp)\d+(?:_[a-z]\d*)?$/i.test(id)) return 'AtCoder';
  if (/^(?:LC|leetcode)[-# ]?\d+$/i.test(id)) return 'LeetCode';
  if (/^cses[-# ]?\d+$/i.test(id)) return 'CSES';
  const clues = (Array.isArray(tags) ? tags : []).concat([context, title]).filter(value => typeof value === 'string').join(' ');
  return judgeFromText(clues) || 'Unknown';
}

function isJudgeProblemUrl(value) {
  let url;
  try { url = new URL(value); } catch (error) { return false; }
  const host = url.hostname.toLowerCase().replace(/^www\./, ''), path = url.pathname;
  if (host === 'codeforces.com') return /^\/(?:problemset\/problem\/\d+\/[A-Z]\w*|contest\/\d+\/problem\/[A-Z]\w*)\/?$/i.test(path);
  if (host === 'atcoder.jp') return /^\/contests\/[^/]+\/tasks\/[^/]+\/?$/i.test(path);
  if (host === 'leetcode.com') return /^\/problems\/[^/]+\/?$/i.test(path);
  if (host === 'cses.fi') return /^\/problemset\/task\/\d+\/?$/i.test(path);
  if (host === 'hackerrank.com') return /^\/challenges\/[^/]+\/?$/i.test(path);
  if (host === 'spoj.com') return /^\/problems\/[^/]+\/?$/i.test(path);
  if (host === 'luogu.com.cn') return /^\/problem\/[A-Z]\d+\/?$/i.test(path);
  if (host === 'vnoj.info' || host === 'oj.vnoi.info') return /^\/problem\/[^/]+\/?$/i.test(path);
  if (host === 'marisaoj.com') return /^\/(?:problem|problems)\/[^/]+\/?$/i.test(path);
  if (/^(?:[^.]+\.)*clue\.edu\.vn$/.test(host)) return /^\/problem\/[^/]+\/?$/i.test(path);
  return false;
}

function groundedProblemUrl(candidate, chunks) {
  const target = cleanProblemUrl(candidate);
  if (!target || !isJudgeProblemUrl(target)) return '';
  const canonical = value => {
    try {
      const url = new URL(cleanProblemUrl(value));
      return `${url.hostname.toLowerCase().replace(/^www\./, '')}${url.pathname.replace(/\/+$/, '')}`;
    } catch (error) { return ''; }
  };
  const key = canonical(target), source = (chunks || []).map(chunk => chunk.web && chunk.web.uri).find(uri => canonical(uri) === key);
  return source ? cleanProblemUrl(source) : '';
}

module.exports = { cleanProblemUrl, judgeFromUrl, problemIdFromUrl, judgeFromText, inferJudge, isJudgeProblemUrl, groundedProblemUrl };
