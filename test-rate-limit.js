// Simple script to test rate limiting
const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:3000/api/generate';
const TOTAL_REQUESTS = 15; // Send 15 requests (more than our limit of 5)
const DELAY_BETWEEN_REQUESTS = 50; // 50ms between requests (faster to trigger rate limit)

// Simple prompt for testing - using a random component to avoid caching
const getTestPrompt = () => ({
  prompt: `A cute cat sitting on a windowsill ${Date.now()}`
});

// Function to send a single request
async function sendRequest(index) {
  try {
    console.log(`Sending request ${index + 1}/${TOTAL_REQUESTS}...`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(getTestPrompt()),
    });
    
    const data = await response.json();
    
    if (response.status === 429) {
      console.log(`✓ Request ${index + 1} was rate limited as expected (429): ${data.error?.message}`);
    } else if (response.ok) {
      console.log(`✓ Request ${index + 1} succeeded (200)`);
    } else {
      console.log(`✗ Request ${index + 1} failed with status ${response.status}: ${data.error?.message || 'Unknown error'}`);
    }
    
    return { status: response.status, data };
  } catch (error) {
    console.error(`✗ Request ${index + 1} failed with error:`, error.message);
    return { status: 'error', error: error.message };
  }
}

// Function to send all requests with a delay between them
async function runTest() {
  console.log(`Starting rate limit test: ${TOTAL_REQUESTS} requests with ${DELAY_BETWEEN_REQUESTS}ms delay`);
  console.log(`Rate limit is set to ${process.env.RATE_LIMIT || 5} requests per ${(process.env.RATE_LIMIT_WINDOW_MS || 60000)/1000} seconds`);
  console.log('-------------------------------------------------------');
  
  const results = [];
  
  for (let i = 0; i < TOTAL_REQUESTS; i++) {
    const result = await sendRequest(i);
    results.push(result);
    
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
runTest().catch(console.error);