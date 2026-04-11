//Player owned games
module.exports = async function handler(req, res) {
  const steamid = req.query.steamid;
  const apiKey = process.env.STEAM_API_KEY;

  if (!steamid) {
    return res.status(400).json({ error: "Adj meg egy Steam ID-t!" });
  }

  if (!apiKey) {
    return res.status(500).json({ error: "Steam API key is not configured" });
  }

  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamid}&include_appinfo=true`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch data from Steam" });
  }
}

