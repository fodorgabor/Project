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
    console.log('APIFY_API token present:', !!token);
    console.log('Query:', query);
    
    // Start actor run
    const startResponse = await fetch('https://api.apify.com/v2/acts/BPhynDzjOF46b7an2/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        input: {
          searchQueries: [query],
          sort: 'relevance',
          maxResultsPerSearch: 50,
          maxSearchPages: 15
        }
      })
    });

    const startText = await startResponse.text();
    console.log('Apify response status:', startResponse.status);
    console.log('Apify response:', startText.substring(0, 500));

    if (!startResponse.ok) {
      throw new Error(`Apify start failed (${startResponse.status}): ${startText}`);
    }

    let runInfo;
    try {
      runInfo = JSON.parse(startText);
    } catch (e) {
      throw new Error(`Invalid JSON from Apify: ${startText.substring(0, 200)}`);
    }
    
    if (!runInfo.data || !runInfo.data.id) {
      throw new Error(`No run ID in response: ${startText}`);
    }
    
    const runId = runInfo.data.id;

    // Wait for completion
    let status = 'RUNNING';
    let items = [];
    
    while (status === 'RUNNING' || status === 'STARTING') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const statusData = await statusResponse.json();
      status = statusData.data.status;
      
      if (status === 'SUCCEEDED') {
        // Get dataset items
        const datasetId = statusData.data.defaultDatasetId;
        const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const datasetText = await datasetResponse.text();
        try {
          items = JSON.parse(datasetText);
        } catch (e) {
          console.error('Dataset parse error:', datasetText.substring(0, 200));
          items = [];
        }
      } else if (status === 'FAILED') {
        throw new Error('Apify actor failed: ' + (statusData.data.errorMessage || 'Unknown error'));
      }
    }

    console.log('Returning items count:', items.length);
    return res.status(200).json({ results: items });
  } catch (error) {
    console.error('Apify error:', error);
    return res.status(500).json({ 
      error: 'Keresési hiba: ' + error.message
    });
  }
}
