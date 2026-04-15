//Teljes steam  könyvtar

// module.exports = async function handler(req, res) {
//   const url = 'https://partner.steam-api.com/IStoreService/GetAppList/v1/'; 
//   try {
//     const response = await fetch(url);
//     const data = await response.json();
//     return res.status(200).json(data);
//   } catch (error) {
//     return res.status(500).json({ error: 'Nem sikerült lekérni az alkalmazás listát' });
//   }
// }


// Fontos https://cdn.cloudflare.steamstatic.com/steam/apps/APPID/header.jpg


export default async function handler(req, res) {
  const response = await fetch("https://api.steampowered.com/ISteamApps/GetAppList/v2/", {
  next: { revalidate: 86400 }
})

  const data = await response.json()

  res.json(data.applist.apps.slice(0, 100))
}