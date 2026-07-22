const https = require('https');

/**
 * Executa query SQL na Cloudflare D1 REST API
 */
function queryD1(accountId, databaseId, token, sql, params = []) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
    const bodyData = JSON.stringify({ sql, params });

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyData)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          if (!parsed.success) {
            return reject(new Error(parsed.errors?.[0]?.message || 'Erro na Cloudflare D1 API'));
          }
          const resultObj = parsed.result?.[0] || {};
          resolve({
            results: resultObj.results || [],
            success: resultObj.success !== false,
            meta: resultObj.meta || {}
          });
        } catch (e) {
          reject(new Error('Erro ao interpretar resposta JSON da Cloudflare D1 API'));
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(bodyData);
    req.end();
  });
}

module.exports = { queryD1 };
