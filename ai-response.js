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

// Mã bài: bỏ tiền tố "Problem"/"#", loại bỏ giá trị rác (URL, trùng tên bài, quá dài, "unknown").
function cleanProblemId(value, title = '') {
  const id = String(value || '').replace(/\s+/g, ' ').trim()
    .replace(/^(?:problem|prob|task|id)\b\s*[:#\-]?\s*/i, '').replace(/^["'`#]+|["'`.,;]+$/g, '').trim();
  if (!id || id.length > 40 || /https?:\/\//i.test(id) || /^(?:unknown|none|null|n\/?a|-+)$/i.test(id)) return '';
  const name = String(title || '').trim().toLowerCase();
  return name && id.toLowerCase() === name ? '' : id;
}

function normalizeProblemResponse(value, { inferJudge, cleanProblemUrl, isJudgeProblemUrl, problemIdFromUrl }) {
  const response = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const text = key => typeof response[key] === 'string' ? response[key].trim() : '';
  const urls = (Array.isArray(response.visible_urls) ? response.visible_urls : [])
    .map(cleanProblemUrl).filter(Boolean);
  const directUrl = cleanProblemUrl(text('problem_url'));
  const hasDirectEvidence = directUrl && (urls.includes(directUrl) || (!urls.length && isJudgeProblemUrl && isJudgeProblemUrl(directUrl)));
  // Mã bài lấy từ URL hiển thị (nguồn đáng tin nhất) rồi mới đến mã AI đọc được từ chữ trong ảnh.
  const urlPid = [directUrl].concat(urls).map(problemIdFromUrl || (() => '')).find(Boolean) || '';
  const pid = cleanProblemId(urlPid || text('problem_id'), text('title'));
  const reportedJudge = text('judge'), judgeClue = !reportedJudge || /^unknown$/i.test(reportedJudge) ? (text('site') || reportedJudge) : reportedJudge;
  const site = inferJudge(judgeClue, urls.concat(directUrl), pid, [], text('problem_context'), text('title'));
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
    rating, ratingStatus: normalizedRatingStatus
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

// Ước lượng rating: AI trả về một số nguyên; 0/không hợp lệ = không đủ dữ liệu. Giá trị ngoài 800-3500 được kéo về biên
// (bài rất dễ/khó trên thang khác Codeforces vẫn có rating) thay vì bị loại bỏ.
function ratingEstimateMetadata(estimate) {
  const value = Number(estimate);
  if (!Number.isFinite(value) || value <= 0) return { ratingEstimate: null, ratingEstimateStatus: 'unavailable' };
  return { ratingEstimate: Math.min(3500, Math.max(800, Math.round(value / 100) * 100)), ratingEstimateStatus: '' };
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

const parseRetryDelay = value => { const m = /^(\d+(?:\.\d+)?)s$/.exec(String(value || '').trim()); return m ? Math.round(parseFloat(m[1]) * 1000) : 0; };

// Lỗi từ nhà cung cấp. Với 429 đọc thêm: thời gian cần chờ (retryDelay / Retry-After / "retry in 23s") và phạm vi hạn mức
// (quotaScope: 'minute' = chạm RPM/TPM, chỉ cần chờ; 'day' = hết hạn mức ngày, chờ vô ích).
function providerError(status, body, headers) {
  const rawMessage = body && body.error && body.error.message;
  const message = redactProviderMessage(rawMessage);
  const error = new Error(`HTTP ${status}${message ? `: ${message}` : ''}`);
  error.status = status;
  error.modelUnavailable = status === 404 || (status === 400 && /model.*(not found|unavailable|not supported)|no longer available/i.test(message));
  let retryAfterMs = 0, scope = '';
  const details = Array.isArray(body && body.error && body.error.details) ? body.error.details : [];
  for (const detail of details) {
    const type = String(detail && detail['@type'] || '');
    if (/RetryInfo$/.test(type)) retryAfterMs = Math.max(retryAfterMs, parseRetryDelay(detail.retryDelay));
    if (/QuotaFailure$/.test(type)) for (const violation of Array.isArray(detail.violations) ? detail.violations : []) {
      const id = String(violation && (violation.quotaId || violation.quotaMetric) || '');
      if (/PerDay/i.test(id)) scope = 'day'; else if (/PerMinute/i.test(id) && scope !== 'day') scope = 'minute';
    }
  }
  const header = headers && typeof headers.get === 'function' ? Number(headers.get('retry-after')) : NaN;
  if (!retryAfterMs && Number.isFinite(header) && header > 0) retryAfterMs = Math.round(header * 1000);
  if (!retryAfterMs) { const m = /retry in (\d+(?:\.\d+)?)\s*s/i.exec(String(rawMessage || '')); if (m) retryAfterMs = Math.round(parseFloat(m[1]) * 1000); }
  error.retryAfterMs = retryAfterMs; error.quotaScope = scope;
  return error;
}

function isRetryableAIError(error) {
  if (!error) return false;
  const message = String(error.message || '');
  if (error.status === 429) {
    if (error.quotaScope === 'day') return false;                                              // hết hạn mức ngày: không thể thử lại ngay
    if (error.quotaScope === 'minute') return !error.retryAfterMs || error.retryAfterMs <= 120000;
    if (error.retryAfterMs) return error.retryAfterMs <= 120000;
    return !/(?:quota.{0,30}(?:exceed|limit|billing)|(?:exceed|limit).{0,30}quota|billing|insufficient quota)/i.test(message);
  }
  return !!(error.modelUnavailable || error.status === 408 || error.status >= 500 ||
    error.name === 'TimeoutError' || error.name === 'AbortError' || error instanceof TypeError ||
    ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND', 'UND_ERR_CONNECT_TIMEOUT'].includes(error.code));
}

// Chờ bao lâu trước lần thử lại thứ attempt+1: theo yêu cầu của server nếu có, nếu không thì lùi dần.
function aiRetryDelayMs(error, attempt = 0) {
  if (error && error.retryAfterMs) return Math.min(error.retryAfterMs + 500, 65000);
  if (error && (error.status === 429 || error.status >= 500)) return [2000, 6000, 15000][Math.min(attempt, 2)];
  return [500, 1500, 3000][Math.min(attempt, 2)];
}

module.exports = { parseAIJSON, parseProviderResponse, normalizeProblemResponse, cleanProblemId, isMarisaUnratedProblem, codeforcesProblemRating, shouldEstimateRating, ratingEstimateMetadata, ratingEstimateFailureMetadata, providerError, isRetryableAIError, aiRetryDelayMs };
