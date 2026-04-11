//Teljes steam  könyvtar
export default async function handler(req, res) {
  const url = 'https://api.steampowered.com/ISteamApps/GetAppList/v2/'; 
  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch app list' });
  }
}