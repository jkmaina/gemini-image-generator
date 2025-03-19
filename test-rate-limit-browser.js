// Browser-based rate limit test
// Copy and paste this into your browser console when on your app's page

async function testRateLimit() {
  const API_URL = '/api/generate';
  const TOTAL_REQUESTS = 15; // More than our limit of 5
  const DELAY_BETWEEN_REQUESTS = 100; // 100ms between requests
  
  // Simple prompt for testing
  const testPrompt = {
    prompt: "A cute cat sitting on a windowsill"
  };
  
  console.log(`Starting rate limit test: ${TOTAL_REQUESTS} requests with ${DELAY_BETWEEN_REQUESTS}ms delay`);
  console.log('-------------------------------------------------------');
  
  const results = [];
  
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    try {
      console.log(`Sending request ${i + 1}/${TOTAL_REQUESTS}...`);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPrompt),
      });
      
      const data = await response.json();
      
      if (response.status === 429) {
        console.log(`✓ Request ${i + 1} was rate limited as expected (429)`);
      } else if (response.ok) {
        console.log(`✓ Request ${i + 1} succeeded (200)`);
      } else {
        console.log(`✗ Request ${i + 1} failed with status ${response.status}: ${data.error?.message || 'Unknown error'}`);
      }
      
      results.push({ status: response.status, data });
    } catch (error) {
      console.error(`✗ Request ${i + 1} failed with error:`, error.message);
      results.push({ status: 'error', error: error.message });
    }
    
    // Add a small delay between requests
    if (i < TOTAL_REQUESTS - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }
  }
  
  // Analyze results
  console.log('\n-------------------------------------------------------');
  console.log('Test completed. Results summary:');
  
  const successful = results.filter(r => r.status === 200).length;
  const rateLimited = results.filter(r => r.status === 429).length;
  const errors = results.filter(r => r.status !== 200 && r.status !== 429).length;
  
  console.log(`- Successful requests: ${successful}`);
  console.log(`- Rate limited requests: ${rateLimited}`);
  console.log(`- Other errors: ${errors}`);
  
  if (rateLimited > 0) {
    console.log('\n✓ Rate limiting is working correctly!');
  } else {
    console.log('\n✗ Rate limiting did not trigger. Check your configuration.');
  }
}

// Run the test
testRateLimit().catch(console.error);