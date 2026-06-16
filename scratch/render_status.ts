async function checkRenderStatus() {
  const apiKey = 'rnd_URvKgPcayUNnnPdJNowdwts4TTM7';
  
  console.log('Fetching Render Services...');
  const response = await fetch('https://api.render.com/v1/services?limit=20', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    console.error('Failed to fetch services:', await response.text());
    return;
  }

  const data = await response.json();
  const workerService = data.find((s: any) => s.service.name.toLowerCase() === 'autodrop-worker' || s.service.name.toLowerCase().includes('autodrop'));
  
  if (!workerService) {
    console.log('Could not find autodrop-worker service. Available services:', data.map((s:any) => s.service.name));
    return;
  }

  const serviceId = workerService.service.id;
  console.log(`✅ Found Render Service: ${workerService.service.name} (ID: ${serviceId})`);
  console.log(`Status: ${workerService.service.suspended === 'suspended' ? 'Suspended' : 'Active'}`);
  console.log(`Type: ${workerService.service.type}`);
  
  console.log('\nFetching latest logs...');
  const logsRes = await fetch(`https://api.render.com/v1/services/${serviceId}/logs?limit=5`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    }
  });

  const logsText = await logsRes.text();
  console.log(logsText.split('\n').slice(0, 10).join('\n'));
}

checkRenderStatus().catch(console.error);
