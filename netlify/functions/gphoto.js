// netlify/functions/gphoto.js

// Netlify Functions (Node 18+) haben global fetch.
// → Kein "node-fetch" nötig.

export const handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const {
      photoreference,
      photo_reference, // fallback
      maxwidth,
      maxheight,
      diag,
    } = params;

    const ref = photoreference || photo_reference;
    if (!ref) {
      return json(400, { ok: false, error: 'Missing "photoreference".' });
    }

    // Mindestens einer der beiden ist sinnvoll.
    const mw = Number(maxwidth) || 0;
    const mh = Number(maxheight) || 0;
    const sizeKey = mw > 0 ? 'maxwidth' : (mh > 0 ? 'maxheight' : 'maxwidth');
    const sizeVal = mw > 0 ? String(mw) : (mh > 0 ? String(mh) : '800');

    // API-Key aus den Site-Env-Variablen
    const key =
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!key) {
      return json(500, { ok: false, error: 'Google API key missing on server.' });
    }

    const qs = new URLSearchParams();
    qs.set(sizeKey, sizeVal);
    qs.set('photo_reference', ref);
    qs.set('key', key);

    const url = `https://maps.googleapis.com/maps/api/place/photo?${qs.toString()}`;

    // Diagnose: zeigt, welcher Key genutzt wird (nur ob vorhanden) + die gebaute URL (Key maskiert)
    if (diag) {
      return json(200, {
        ok: true,
        received: { photoreference: ref, maxwidth: mw || null, maxheight: mh || null },
        builtUrl: url.replace(key, '***'),
        usedEnvVar: resolveKeyName(),
      });
    }

    // Bild abrufen (Google gibt 302 → mit follow holen wir direkt die Bilddaten)
    const upstream = await fetch(url, { redirect: 'follow' });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return {
        statusCode: upstream.status,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
        body: text || `Upstream error ${upstream.status}`,
      };
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const ab = await upstream.arrayBuffer();
    const b64 = Buffer.from(ab).toString('base64');

    return {
      statusCode: 200,
      isBase64Encoded: true,                 // wichtig für Binärdaten
      headers: {
        'content-type': contentType,
        // Caching (24h) – passt gut, weil Photorefs lange stabil sind
        'cache-control': 'public, max-age=86400, immutable'
      },
      body: b64,
    };
  } catch (err) {
    return json(500, { ok: false, error: `Proxy error: ${err?.message || 'unknown'}` });
  }

  function json(status, obj) {
    return {
      statusCode: status,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(obj),
    };
  }

  function resolveKeyName() {
    if (process.env.VITE_GOOGLE_MAPS_API_KEY) return 'VITE_GOOGLE_MAPS_API_KEY';
    if (process.env.GOOGLE_MAPS_API_KEY) return 'GOOGLE_MAPS_API_KEY';
    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY';
    return '(none)';
  }
};
