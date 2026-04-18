export default async function handler(req, res) {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Hiányzó keresési kifejezés' });
  }

  try {
    const url = `https://store.steampowered.com/search/results/?term=${encodeURIComponent(query)}&json=1&count=50&start=0&cc=HU`;
    const response = await fetch(url);
    const data = await response.json();

  const results = (data.items || []).map(item => {
    const match = item.logo.match(/apps\/(\d+)\//);
    const appid = match ? parseInt(match[1]) : null;
    return {
      appid,
      name: item.name,
      image: item.logo,
    };
  });

    return res.status(200).json({ results });
  } catch (error) {
    return res.status(500).json({ error: 'Keresési hiba: ' + error.message });
  }
}