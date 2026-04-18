export default async function handler(req, res) {
  const steamid = req.query.steamid;
  const apiKey = process.env.STEAM_API_KEY;

  if (!steamid) {
    return res.status(400).json({ error: 'Hiányzó steamid' });
  }
  if (!apiKey) {
    return res.status(500).json({ error: 'Hiányzik a STEAM_API_KEY környezeti változó' });
  }

  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${encodeURIComponent(apiKey)}&steamid=${encodeURIComponent(steamid)}&include_appinfo=true&include_played_free_games=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Steam API hiba: ${response.status}`);
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}