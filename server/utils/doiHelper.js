import https from 'https';

/**
 * Fetches publication metadata for a given DOI from CrossRef REST API
 * @param {string} rawDoi - DOI string or URL
 * @returns {Promise<Object>} Formatted publication metadata
 */
export const fetchPublicationByDoi = (rawDoi) => {
  return new Promise((resolve, reject) => {
    if (!rawDoi || typeof rawDoi !== 'string') {
      return reject(new Error('Valid DOI string is required.'));
    }

    // Clean DOI: strip URL prefix, spaces, and leading/trailing slashes
    let cleanDoi = rawDoi.trim()
      .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
      .replace(/^doi:\s*/i, '')
      .trim();

    if (!cleanDoi.includes('/')) {
      return reject(new Error('Invalid DOI format. A valid DOI must contain a prefix and suffix separated by "/" (e.g., 10.1016/j.engappai.2024.108920).'));
    }

    const url = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`;
    const options = {
      headers: {
        'User-Agent': 'SREC-FIS/2.0 (mailto:admin@srec.ac.in)',
        'Accept': 'application/json'
      },
      timeout: 8000
    };

    const req = https.get(url, options, (res) => {
      if (res.statusCode === 404) {
        return reject(new Error(`DOI "${cleanDoi}" was not found in the CrossRef registry.`));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`CrossRef API returned status ${res.statusCode}.`));
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const item = json.message || {};

          // Extract title
          const title = Array.isArray(item.title) ? item.title[0] : (item.title || '');

          // Extract authors
          let authors = '';
          if (Array.isArray(item.author) && item.author.length > 0) {
            authors = item.author.map((a) => {
              const given = a.given ? a.given.trim() : '';
              const family = a.family ? a.family.trim() : '';
              return [given, family].filter(Boolean).join(' ');
            }).filter(Boolean).join(', ');
          }

          // Extract journal / container name
          const containerTitle = Array.isArray(item['container-title'])
            ? item['container-title'][0]
            : (item['container-title'] || '');

          // Extract publication year and month
          let year = '';
          let month = '';
          const dateParts = item['published-print']?.['date-parts'] ||
                            item['published-online']?.['date-parts'] ||
                            item['published']?.['date-parts'] ||
                            item['created']?.['date-parts'] || [];

          if (dateParts.length > 0 && Array.isArray(dateParts[0])) {
            const parts = dateParts[0];
            if (parts[0]) year = String(parts[0]);
            if (parts[1]) month = String(parts[1]).padStart(2, '0');
          }

          // Extract ISSN / ISBN
          const issn = Array.isArray(item.ISSN) ? item.ISSN.join(', ') : (item.ISSN || '');
          const isbn = Array.isArray(item.ISBN) ? item.ISBN.join(', ') : (item.ISBN || '');

          // Extract volume, issue, pages
          const volume = item.volume ? String(item.volume) : '';
          const issue = item.issue ? String(item.issue) : '';
          const page = item.page ? String(item.page) : '';
          const publisher = item.publisher ? String(item.publisher) : '';

          // Determine category (Journal / Conference / Book Chapter)
          const type = (item.type || '').toLowerCase();
          let category = 'Journal';
          if (type.includes('proceedings') || type.includes('conference')) {
            category = 'Conference';
          } else if (type.includes('book') || type.includes('chapter')) {
            category = 'Book Chapter';
          }

          resolve({
            success: true,
            doi: cleanDoi,
            doi_url: `https://doi.org/${cleanDoi}`,
            title,
            authors,
            journal: containerTitle,
            category,
            year,
            month,
            volume,
            issue,
            page,
            issn: issn || isbn,
            publisher
          });
        } catch (parseErr) {
          reject(new Error('Failed to parse CrossRef response: ' + parseErr.message));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('CrossRef request timed out. Please verify your internet connection or enter details manually.'));
    });

    req.on('error', (err) => {
      reject(new Error('Network error connecting to CrossRef: ' + err.message));
    });
  });
};
