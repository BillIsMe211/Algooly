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

// ---------- nhận diện site tổng quát: không giới hạn ở danh sách JUDGE_URLS
const NOISE_HOSTS = /(?:^|\.)(?:google\.[a-z.]+|googleusercontent\.com|gstatic\.com|youtube\.com|youtu\.be|facebook\.com|fb\.com|messenger\.com|twitter\.com|x\.com|instagram\.com|tiktok\.com|linkedin\.com|reddit\.com|discord\.com|discord\.gg|telegram\.org|t\.me|zalo\.me|github\.com|github\.io|githubusercontent\.com|gitlab\.com|stackoverflow\.com|stackexchange\.com|wikipedia\.org|medium\.com|notion\.so|openai\.com|chatgpt\.com|claude\.ai|anthropic\.com|bing\.com|microsoft\.com|live\.com|office\.com|dropbox\.com|localhost)$/i;
const hostOf = value => { try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ''); } catch (error) { return ''; } };
const isNoiseHost = host => !host || !host.includes('.') || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host) || NOISE_HOSTS.test(host);

function registrableDomain(host) {
  const labels = String(host || '').toLowerCase().replace(/^www\./, '').split('.').filter(Boolean);
  if (labels.length <= 2) return labels.join('.');
  const second = labels[labels.length - 2], last = labels[labels.length - 1];
  return labels.slice(/^(?:com|org|net|edu|gov|ac|co|or|ne)$/.test(second) && last.length === 2 ? -3 : -2).join('.');   // luogu.com.cn, clue.edu.vn, ...
}

// Tên hiển thị của một site từ hostname: judge đã biết -> tên chuẩn, còn lại -> "Eolymp", "Timus", "oj.uz"
function siteFromHost(host) {
  const known = JUDGE_URLS.find(([pattern]) => pattern.test(host));
  if (known) return known[1];
  const domain = registrableDomain(host), label = domain.split('.')[0];
  if (!label) return '';
  if (label.length < 4) return domain;
  return label.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('-');
}

const PROBLEM_SEGMENT = /^(?:problems?|tasks?|challenges?|questions?|exercises?|puzzles?|katas?|problemset|viewproblem\d*)$/;
const NON_PROBLEM_SEGMENT = /^(?:submit|submissions?|status|ranking|standings|editorials?|solutions?|discuss|comments?|tags?|stats|statistics|my|new|create|edit)$/;
const ID_QUERY_KEYS = /^(?:pid|problem|problem_?id|problemid|task|task_?id|taskid|qid|cpid|num|id|code)$/i;
// Đường dẫn có "dạng trang đề bài" (/problem/<id>, /problems/<slug>, problem.aspx?num=1000, ...), không phải trang danh sách/tìm kiếm.
function looksLikeProblemUrl(value) {
  let url;
  try { url = new URL(value); } catch (error) { return false; }
  const segments = url.pathname.split('/').filter(Boolean).map(part => { try { return decodeURIComponent(part).toLowerCase(); } catch (error) { return part.toLowerCase(); } });
  const stripped = segments.map(part => part.replace(/\.(?:aspx?|php|html?|jsp)$/, ''));
  const keys = [...url.searchParams.keys()], hasIdKey = keys.some(key => ID_QUERY_KEYS.test(key));
  const index = stripped.findIndex(part => PROBLEM_SEGMENT.test(part));
  if (index >= 0) {
    const rest = stripped.slice(index + 1);
    if (rest.length && !NON_PROBLEM_SEGMENT.test(rest[0]) && !(rest.length === 1 && /^(?:view|all)$/.test(rest[0]))) return true;
    if (!rest.length && hasIdKey) return true;
  }
  return hasIdKey && [...url.searchParams.values()].some(v => /problem|task/i.test(v));      // vd. usaco.org/index.php?page=viewproblem2&cpid=1
}

const norm = text => String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
function siteMatchesHost(site, host) {
  const name = norm(site);
  if (!name || /^unknown$/i.test(site)) return false;
  return name === norm(siteFromHost(host)) || name === norm(registrableDomain(host)) || (name.length >= 4 && norm(host).includes(name));
}

const IMPLAUSIBLE_SITE = /^(?:unknown|none|null|undefined|n\/?a|other|others|not available|not specified|unspecified|judge|website|web|competitive programming|-+)$/i;
function plausibleSiteName(value) {
  let text = String(value || '').replace(/\s+/g, ' ').trim().replace(/^["'`]+|["'`.]+$/g, '');
  text = text.replace(/(?:^|\s)(?:online\s+judge|oj)(?=\s|$)/ig, ' ').replace(/\s+/g, ' ').trim();   // "Timus Online Judge" -> "Timus"; "oj.uz" stays intact
  if (!text || text.length > 40 || text.split(' ').length > 4 || /[\/\\<>@]|https?:/i.test(text) || IMPLAUSIBLE_SITE.test(text)) return '';
  return text;
}
function displaySiteName(text) {
  if (text.includes('.')) return text.toLowerCase();                                            // dạng domain: oj.uz
  if (text !== text.toLowerCase() && !(text === text.toUpperCase() && text.length <= 6)) return text;   // đã có chữ hoa: giữ nguyên
  if (text === text.toUpperCase() && text.length <= 6 && /[A-Z]/.test(text)) return text;       // viết tắt: UVA, POJ
  return text.toLowerCase().split(' ').map(word => word.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('-')).join(' ');   // eolymp -> Eolymp
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
    if (host === 'codeforces.com') {
      const match = /^\/(?:problemset\/problem\/(\d+)\/([A-Z]\d*)|contest\/(\d+)\/problem\/([A-Z]\d*))\/?$/i.exec(url.pathname);
      return match ? `${match[1] || match[3]}${(match[2] || match[4]).toUpperCase()}` : '';
    }
    if (isNoiseHost(host) || !looksLikeProblemUrl(url.href)) return '';
    for (const [key, v] of url.searchParams) if (ID_QUERY_KEYS.test(key) && /^[\w.\-]{1,40}$/.test(v) && !/problem|task/i.test(v)) return v;
    const last = url.pathname.split('/').filter(Boolean).pop() || '', id = last.replace(/\.(?:aspx?|php|html?|jsp)$/i, '');
    return /^[A-Za-z0-9_.\-]{1,40}$/.test(id) && !PROBLEM_SEGMENT.test(id.toLowerCase()) && !/^(?:view|index|statement|description)$/i.test(id) ? id : '';
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
  const list = Array.isArray(urls) ? urls : [];
  for (const value of list) {
    const judge = judgeFromUrl(value);
    if (judge) return judge;                                                  // URL của judge đã biết
  }
  const named = judgeFromText(site);
  if (named && named !== 'Unknown') return named;                             // tên judge đã biết (kể cả viết tắt)
  for (const value of list) {                                                 // URL trang đề bài của BẤT KỲ site nào
    const host = hostOf(value);
    if (!isNoiseHost(host) && looksLikeProblemUrl(value)) return siteFromHost(host);
  }
  const reported = plausibleSiteName(site);                                   // tên site do AI báo, vd. "eolymp", "oj.uz"
  if (reported) return displaySiteName(reported);
  const id = String(pid || '').trim();
  if (/^(?:CF[-\s:]*)?\d+\s*[-/]?\s*[A-Z]\d*$/i.test(id)) return 'Codeforces';
  if (/^(?:abc|arc|agc|typical90|dp)\d+(?:_[a-z]\d*)?$/i.test(id)) return 'AtCoder';
  if (/^(?:LC|leetcode)[-# ]?\d+$/i.test(id)) return 'LeetCode';
  if (/^cses[-# ]?\d+$/i.test(id)) return 'CSES';
  const clues = (Array.isArray(tags) ? tags : []).concat([context, title]).filter(value => typeof value === 'string').join(' ');
  const fromClues = judgeFromText(clues);
  if (fromClues && fromClues !== 'Unknown') return fromClues;
  const hosts = [...new Set(list.map(hostOf).filter(host => !isNoiseHost(host)).map(registrableDomain))];
  if (hosts.length === 1) return siteFromHost(hosts[0]);                      // chỉ có đúng một site lạ xuất hiện trong ảnh
  return 'Unknown';
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
  if (host === 'codechef.com') return /^\/problems\/[A-Z0-9_]+\/?$/i.test(path);
  if (host === 'open.kattis.com') return /^\/problems\/[^/]+\/?$/i.test(path);
  if (host === 'dmoj.ca') return /^\/problem\/[^/]+\/?$/i.test(path);
  return false;
}

// Domain gợi ý cho bước tìm link (chỉ với judge đã biết).
const SEARCH_DOMAINS = { Codeforces: 'codeforces.com', AtCoder: 'atcoder.jp', LeetCode: 'leetcode.com', CSES: 'cses.fi', HackerRank: 'hackerrank.com', SPOJ: 'spoj.com', Luogu: 'luogu.com.cn', VNOI: 'oj.vnoi.info', MarisaOJ: 'marisaoj.com', ClueOJ: 'oj.clue.edu.vn', CodeChef: 'codechef.com', Kattis: 'open.kattis.com', DMOJ: 'dmoj.ca' };
const judgeSearchDomain = site => Object.prototype.hasOwnProperty.call(SEARCH_DOMAINS, site) ? SEARCH_DOMAINS[site] : '';

// Link đề bài hợp lệ: khớp mẫu của judge đã biết, hoặc (site đã nhận diện, bất kỳ) có dạng trang đề bài và đúng host của site đó.
function isProblemPageUrl(value, site = '') {
  if (isJudgeProblemUrl(value)) return true;
  const host = hostOf(value);
  return !isNoiseHost(host) && looksLikeProblemUrl(value) && siteMatchesHost(site, host);
}

function groundedProblemUrl(candidate, chunks, expectedSite = '') {
  const target = cleanProblemUrl(candidate);
  if (!target || !isProblemPageUrl(target, expectedSite)) return '';
  const found = judgeFromUrl(target);
  if (expectedSite && !/^unknown$/i.test(expectedSite) && found && found !== expectedSite) return '';   // wrong judge for this problem
  const withQuery = !isJudgeProblemUrl(target);                                   // trang đề dựa vào query (vd. problem.aspx?num=1000) thì phải so cả query
  const canonical = value => {
    try {
      const url = new URL(cleanProblemUrl(value));
      return `${url.hostname.toLowerCase().replace(/^www\./, '')}${url.pathname.replace(/\/+$/, '')}${withQuery ? url.search : ''}`;
    } catch (error) { return ''; }
  };
  const key = canonical(target), source = (chunks || []).map(chunk => chunk.web && chunk.web.uri).find(uri => canonical(uri) === key);
  return source ? cleanProblemUrl(source) : '';
}

module.exports = { cleanProblemUrl, judgeFromUrl, problemIdFromUrl, judgeFromText, inferJudge, isJudgeProblemUrl, isProblemPageUrl, looksLikeProblemUrl, siteFromHost, groundedProblemUrl, judgeSearchDomain };
