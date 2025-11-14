# 🔮 AI智能解卦使用指南

## 功能简介

小六壬排盘工具现已集成AI智能解卦功能，支持 **Google Gemini** 和 **Anthropic Claude** 两大AI模型，为您提供专业的卦象解析。

## 支持的AI模型

### 1. Google Gemini
- **模型**: Gemini Pro
- **获取API Key**: https://ai.google.dev/
- **优势**: 响应速度快，免费额度充足

### 2. Anthropic Claude
- **模型**: Claude 3.5 Sonnet
- **获取API Key**: https://console.anthropic.com/
- **优势**: 解析深度好，理解能力强

## 使用步骤

### Step 1: 完成排盘
1. 输入日期（1-30）
2. 选择时辰（子时到亥时）
3. 点击「开始排盘」

### Step 2: 配置AI
1. 在"AI智能解卦"区域选择您想使用的AI模型（Gemini或Claude）
2. 输入对应的API Key
3. 点击「保存」按钮（API Key会保存在浏览器本地，不会上传到服务器）

### Step 3: 提问解卦
1. 在问题输入框输入您的问题，例如：
   - "感情运势如何？"
   - "近期事业发展怎么样？"
   - "这次考试能否通过？"
   - "适合换工作吗？"
2. 点击「✨ 开始AI解卦」
3. 等待AI分析（通常需要5-15秒）

### Step 4: 查看解析
AI会从以下角度为您解卦：
- 📖 主卦象解读（结合自身宫位、五行、神煞）
- 👥 六亲关系分析（父母、子孙、官鬼、妻财、兄弟）
- ⚖️ 五行生克分析
- 💡 针对问题的具体建议
- 🎯 吉凶判断和注意事项

## API Key获取指南

### Gemini API Key
1. 访问 https://ai.google.dev/
2. 点击「Get API Key in Google AI Studio」
3. 登录Google账号
4. 点击「Create API Key」
5. 复制生成的API Key

### Claude API Key
1. 访问 https://console.anthropic.com/
2. 注册/登录Anthropic账号
3. 进入「API Keys」页面
4. 点击「Create Key」
5. 复制生成的API Key

## 费用说明

### Gemini
- 免费额度：每分钟60次请求
- 适合个人使用

### Claude
- 需要充值使用
- Claude 3.5 Sonnet: $3/百万输入tokens, $15/百万输出tokens
- 单次解卦成本约 $0.01-0.03

## 隐私安全

✅ **完全安全**:
- API Key仅保存在您的浏览器本地（localStorage）
- 不会上传到任何服务器
- API调用直接从您的浏览器发送到Google/Anthropic服务器
- 我们无法看到您的API Key或问题内容

## 常见问题

### Q1: API调用失败怎么办？
**A:** 请检查：
1. API Key是否正确（没有多余空格）
2. 网络连接是否正常
3. API额度是否充足
4. 是否需要科学上网（Gemini在某些地区可能受限）

### Q2: Gemini和Claude选哪个？
**A:** 
- **Gemini**: 推荐新手，免费额度充足，响应快
- **Claude**: 推荐深度使用者，解析更细致，需付费

### Q3: 解卦准确吗？
**A:** AI解卦基于：
- 传统小六壬理论
- 当前排盘的客观数据
- AI的知识整合能力

准确度取决于问题的具体性和AI的理解能力。建议作为参考，结合自身实际情况判断。

### Q4: 可以连续解卦吗？
**A:** 可以！每次排盘后都可以：
- 针对不同问题多次解卦
- 切换不同AI模型对比结果
- 调整问题获得更详细的解答

## 技术支持

如遇问题，请：
1. 检查浏览器控制台错误信息（F12 → Console）
2. 确认API Key格式正确
3. 尝试切换AI模型
4. 在GitHub Issues反馈问题

---

**祝您卜卦顺利，心想事成！🍀**

