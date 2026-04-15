//Teljes steam  könyvtar
module.exports = async function handler(req, res) {
  const url = 'https://partner.steam-api.com/IStoreService/GetAppList/v1/'; 
  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Nem sikerült lekérni az alkalmazás listát' });
  }
}