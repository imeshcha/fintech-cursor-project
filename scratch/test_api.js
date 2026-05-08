
async function testChat() {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'check my balance' }]
    })
  });

  if (!response.ok) {
    console.error('Error:', await response.text());
    return;
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  
  console.log('--- RAW STREAM START ---');
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log(decoder.decode(value, { stream: true }));
  }
  console.log('--- RAW STREAM END ---');
}

testChat();
