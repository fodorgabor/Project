export default async function handler(req, res) {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Hiányzó keresési kifejezés' });
  }

  try {
    // Steam Store Search API – publikus, nem kell API kulcs, azonnali
    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=hungarian&cc=HU`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Steam API hiba: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(200).json({ results: [] });
    }

    // Steam storesearch formátumot átalakítjuk a meglévő formátumra
    const results = data.items.map(item => ({
      appid: item.id,
      name: item.name,
    }));

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Keresési hiba: ' + error.message });
  }
}
