/**
 * 本地测试脚本
 * 用法: node test.js
 */

const API_URL = process.argv[2] || 'http://localhost:3000/api';

async function testHealth() {
  console.log('🔍 测试健康检查接口...');
  
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    console.log('✅ 健康检查成功:', data);
    return true;
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message);
    return false;
  }
}

async function testGemini() {
  console.log('\n🔍 测试Gemini API...');
  
  const testPrompt = '你好，请简单介绍一下小六壬。';
  
  try {
    const response = await fetch(`${API_URL}/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: testPrompt,
        userToken: 'free',
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Gemini调用成功');
      console.log('📊 返回数据:', {
        success: data.success,
        plan: data.plan,
        remaining: data.remaining,
        resultLength: data.result?.length || 0,
      });
      console.log('📝 AI回复预览:', data.result?.substring(0, 100) + '...');
      return true;
    } else {
      console.log('⚠️ Gemini调用失败:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Gemini调用错误:', error.message);
    return false;
  }
}

async function testRateLimit() {
  console.log('\n🔍 测试限流功能（连续调用4次）...');
  
  for (let i = 1; i <= 4; i++) {
    console.log(`\n第 ${i} 次调用:`);
    
    try {
      const response = await fetch(`${API_URL}/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `测试请求 ${i}`,
          userToken: 'free',
        }),
      });
      
      const data = await response.json();
      
      if (response.status === 429) {
        console.log('✅ 限流生效:', data.message);
        return true;
      } else {
        console.log(`📊 剩余次数: ${data.remaining}`);
      }
    } catch (error) {
      console.error('❌ 请求错误:', error.message);
    }
    
    // 等待500ms避免太快
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return true;
}

async function runTests() {
  console.log('🚀 开始测试 Mysterious API');
  console.log(`📍 API地址: ${API_URL}\n`);
  
  const healthOk = await testHealth();
  
  if (!healthOk) {
    console.log('\n❌ 健康检查失败，跳过其他测试');
    console.log('💡 请确保API服务正在运行: vercel dev');
    return;
  }
  
  await testGemini();
  await testRateLimit();
  
  console.log('\n✅ 所有测试完成！');
}

runTests();





