export default async function handler(req, res) {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Hiányzó keresési kifejezés' });
  }

  try {
    const fetches = [0, 10, 20, 30, 40].map(start =>
      fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=hungarian&cc=HU&count=10&start=${start}`)
        .then(r => r.json())
    );

    const pages = await Promise.all(fetches);

    const results = pages.flatMap(page =>
      (page.items || []).map(item => ({
        appid: item.id,
        name: item.name,
        image: item.tiny_image,
      }))
    );

    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ error: 'Keresési hiba: ' + error.message });
  }
}