/**
 * 测试CORS和Gemini API
 */

const API_URL = process.argv[2] || 'https://mysterious-o4mqrcemy-lexas-projects-96397e06.vercel.app/api';

async function testCORS() {
  console.log('🔍 测试 CORS 预检请求（OPTIONS）...\n');
  
  try {
    const response = await fetch(`${API_URL}/gemini`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    
    console.log('📊 响应状态:', response.status);
    console.log('📋 响应 Headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    
    if (response.headers.get('access-control-allow-origin')) {
      console.log('\n✅ CORS headers 存在！');
    } else {
      console.log('\n❌ 缺少 Access-Control-Allow-Origin header!');
    }
    
  } catch (error) {
    console.error('❌ OPTIONS 请求失败:', error.message);
  }
}

async function testPOST() {
  console.log('\n\n🔍 测试 POST 请求...\n');
  
  try {
    const response = await fetch(`${API_URL}/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000',
      },
      body: JSON.stringify({
        prompt: '测试',
        userToken: 'free',
      }),
    });
    
    console.log('📊 响应状态:', response.status);
    console.log('📋 响应 Headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });
    
    const data = await response.text();
    console.log('\n📝 响应内容:');
    console.log(data.substring(0, 500));
    
  } catch (error) {
    console.error('❌ POST 请求失败:', error.message);
  }
}

async function run() {
  console.log(`🚀 测试 API: ${API_URL}\n`);
  await testCORS();
  await testPOST();
}

run();





