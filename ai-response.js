function invalidAIResponse(message) {
  const error = new Error(message);
  error.invalidAIResponse = true;
  return error;
}

function requireJSONObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw invalidAIResponse('AI response must be a JSON object');
  }
  return value;
}

function parseAIJSON(text) {
  const cleaned = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return requireJSONObject(JSON.parse(cleaned)); }
  catch (error) { if (error && error.invalidAIResponse) throw error; }
  const start = cleaned.indexOf('{');
  if (start < 0) throw invalidAIResponse('invalid JSON response');
  let depth = 0, quoted = false, escaped = false;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') quoted = false;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) {
      try { return requireJSONObject(JSON.parse(cleaned.slice(start, i + 1))); }
      catch (error) { throw invalidAIResponse('invalid JSON response'); }
    }
  }
  throw invalidAIResponse('incomplete JSON response');
}

function responseText(provider, body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return '';
  if (provider === 'openai-compatible') {
    const choice = Array.isArray(body.choices) ? body.choices[0] : null;
    const content = choice && choice.message && choice.message.content;
    if (typeof content === 'string') return content;
    return Array.isArray(content) ? content.map(part => part && typeof part.text === 'string' ? part.text : '').join('') : '';
  }
  const candidate = Array.isArray(body.candidates) ? body.candidates[0] : null;
  const parts = candidate && candidate.content && candidate.content.parts;
  return Array.isArray(parts) ? parts.map(part => part && typeof part.text === 'string' ? part.text : '').join('') : '';
}

function parseProviderResponse(provider, body) {
  const text = responseText(provider, body);
  if (!text.trim()) throw invalidAIResponse('empty or malformed AI response');
  return parseAIJSON(text);
}

function normalizeProblemResponse(value, { inferJudge, cleanProblemUrl, isJudgeProblemUrl, problemIdFromUrl }) {
  const response = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const text = key => typeof response[key] === 'string' ? response[key].trim() : '';
  const urls = (Array.isArray(response.visible_urls) ? response.visible_urls : [])
    .map(cleanProblemUrl).filter(Boolean);
  const directUrl = cleanProblemUrl(text('problem_url'));
  const hasDirectEvidence = directUrl && (urls.includes(directUrl) || (!urls.length && isJudgeProblemUrl && isJudgeProblemUrl(directUrl)));
  const pid = text('problem_id') || [directUrl].concat(urls).map(problemIdFromUrl || (() => '')).find(Boolean) || '';
  const tags = (Array.isArray(response.tags) ? response.tags : [])
    .filter(tag => typeof tag === 'string').map(tag => tag.trim())
    .filter(tag => tag && !/^(?:unknown|no solution|none|n\/?a|not available)$/i.test(tag)).slice(0, 3);
  const reportedJudge = text('judge'), judgeClue = !reportedJudge || /^unknown$/i.test(reportedJudge) ? (text('site') || reportedJudge) : reportedJudge;
  const site = inferJudge(judgeClue, urls.concat(directUrl), pid, tags, text('problem_context'), text('title'));
  const judge = site === 'Unknown' ? 'unknown' : site.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const ratingStatus = ['rated', 'unrated', 'unknown'].includes(text('ratingStatus').toLowerCase())
    ? text('ratingStatus').toLowerCase() : 'unknown';
  const rawRating = response.rating;
  const rating = ratingStatus === 'rated' && typeof rawRating === 'number' && Number.isFinite(rawRating) && rawRating > 0
    ? rawRating : null;
  const normalizedRatingStatus = ratingStatus === 'rated' && rating === null ? 'unknown' : ratingStatus;
  return {
    judge, site, title: text('title'), pid,
    visibleUrls: urls, directUrl,
    url: hasDirectEvidence ? directUrl : '',
    problemContext: text('problem_context').slice(0, 1200),
    difficulty: ({ easy: 'Easy', medium: 'Medium', hard: 'Hard' })[text('difficulty').toLowerCase()] || '',
    rating, ratingStatus: normalizedRatingStatus, tags
  };
}

function isMarisaUnratedProblem(judge, problemId, urls, title = '') {
  if (String(judge || '').toLowerCase() !== 'marisaoj') return false;
  if (/^threepoints$/i.test(String(problemId || '').trim())) return true;
  if (/^three\s*points$/i.test(String(title || '').trim())) return true;
  return (Array.isArray(urls) ? urls : []).some(value => {
    try { return /\/(?:problem|problems)\/threepoints\/?$/i.test(new URL(value).pathname); }
    catch (error) { return false; }
  });
}

function codeforcesProblemRating(value) {
  const rating = typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
  const ratingStatus = rating !== null ? 'rated' : value === null ? 'unrated' : 'unknown';
  return { rating, ratingStatus };
}

function shouldEstimateRating(meta = {}) {
  return !(Number(meta.rating) > 0 || Number(meta.ratingEstimate) > 0);
}

function ratingEstimateMetadata(estimate, confidence) {
  if (!Number.isFinite(estimate) || estimate < 800 || estimate > 3500 || !Number.isFinite(confidence) || confidence < 0.55) {
    return { ratingEstimate: null, ratingConfidence: null, ratingEstimateStatus: 'unavailable' };
  }
  return {
    ratingEstimate: Math.round(estimate / 100) * 100,
    ratingConfidence: confidence,
    ratingEstimateStatus: 'estimated',
    ratingStatus: 'estimated'
  };
}

function ratingEstimateFailureMetadata() {
  return { ratingEstimateStatus: 'error' };
}

function redactProviderMessage(value) {
  return String(value || '')
    .replace(/\bBearer\s+\S+/gi, 'Bearer [redacted]')
    .replace(/\b(?:sk-[A-Za-z0-9_-]{10,}|AIza[0-9A-Za-z_-]{20,})\b/g, '[redacted]')
    .slice(0, 160);
}

function providerError(status, body) {
  const rawMessage = body && body.error && body.error.message;
  const message = redactProviderMessage(rawMessage);
  const error = new Error(`HTTP ${status}${message ? `: ${message}` : ''}`);
  error.status = status;
  error.modelUnavailable = status === 404 || (status === 400 && /model.*(not found|unavailable|not supported)|no longer available/i.test(message));
  return error;
}

function isRetryableAIError(error) {
  if (!error) return false;
  const message = String(error.message || '');
  if (error.status === 429 && /(?:quota.{0,30}(?:exceed|limit|billing)|(?:exceed|limit).{0,30}quota|billing|insufficient quota)/i.test(message)) return false;
  return !!(error.modelUnavailable || error.status === 408 || error.status === 429 || error.status >= 500 ||
    error.name === 'TimeoutError' || error.name === 'AbortError' || error instanceof TypeError ||
    ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND', 'UND_ERR_CONNECT_TIMEOUT'].includes(error.code));
}

module.exports = { parseAIJSON, parseProviderResponse, normalizeProblemResponse, isMarisaUnratedProblem, codeforcesProblemRating, shouldEstimateRating, ratingEstimateMetadata, ratingEstimateFailureMetadata, providerError, isRetryableAIError };
