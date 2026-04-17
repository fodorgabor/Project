import { ApifyClient } from 'apify-client';

export default async function handler(req, res) {
  const query = req.query.q;
  const token = process.env.APIFY_API;

  if (!query) {
    return res.status(400).json({ error: 'Hiányzó keresési kifejezés' });
  }
  if (!token) {
    return res.status(500).json({ error: 'Hiányzik az APIFY_API környezeti változó' });
  }

  try {
    const client = new ApifyClient({ token });
    const input = {
      searchQueries: [query],
      sort: 'relevance',
      maxResultsPerSearch: 50,
      maxSearchPages: 15,
      maxRequestRetries: 5
    };

    const run = await client.actor('BPhynDzjOF46b7an2').call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    return res.status(200).json({ results: items });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
