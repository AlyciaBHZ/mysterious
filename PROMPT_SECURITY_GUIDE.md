# 🔐 Prompt 安全保护指南

## ✅ 已完成的安全措施

### 1. Prompt 配置文件隔离

**新增文件结构**：
```
src/
├── prompts.config.ts           ← 完整版本（不提交到GitHub）
├── prompts.config.example.ts   ← 示例版本（公开到GitHub）
├── core.logic.ts              ← 核心算法（不提交）
├── core.logic.example.ts      ← 示例算法（公开）
├── config.local.ts            ← API Key（不提交）
└── config.local.example.ts    ← 示例配置（公开）
```

### 2. .gitignore 保护

已添加以下文件到 `.gitignore`：
```gitignore
# Local config with API keys
src/config.local.ts

# Core algorithm (proprietary)
src/core.logic.ts

# AI Prompt configuration (proprietary)
src/prompts.config.ts
```

### 3. GitHub Actions 配置

在自动部署时使用示例文件：
```yaml
- name: Prepare config files (Example Version)
  run: |
    cp src/config.local.example.ts src/config.local.ts
    cp src/core.logic.example.ts src/core.logic.ts
    cp src/prompts.config.example.ts src/prompts.config.ts
```

---

## 🎯 更新内容详解

### 1. 新的 Prompt 结构

**专业 Prompt（prompts.config.ts）包含**：
- ✅ **起卦时间**：自动获取当前日期和时辰
- ✅ **应期分析**：AI 会分析事情发生的时间点
- ✅ **五行生克详解**：生我、我生、克我、我克、同我的详细分析
- ✅ **六亲关系深入**：针对所问事项的人际互动分析
- ✅ **格式化指令**：确保返回的内容结构清晰、排版优美

**核心函数**：
```typescript
generateDivinationPrompt(
  question: string,          // 用户问题
  palaceList: string[],      // 排盘结果列表
  selfPalace: { title, wuxing },  // 自身宫位信息
  currentDate: string,       // 当前日期
  currentShichen: string     // 当前时辰
)
```

### 2. 用户体验优化

**问题输入框提示**：
```
请集中精神，一事一问。例如："今日财运如何？"、"我和TA的感情走向？"、"这份工作能成吗？"

小六壬善断"当下"和"短期"吉凶，请把问题问得越具体越好。
```

**特点**：
- 引导用户专注一个问题
- 提供具体问题示例
- 说明小六壬的适用范围（当下、短期）

---

## 🔒 安全验证清单

### ✅ GitHub 仓库（main 分支）
- [x] `prompts.config.ts` 不可见
- [x] `core.logic.ts` 不可见
- [x] `config.local.ts` 不可见
- [x] 只包含 `.example.ts` 示例文件

### ✅ 本地开发环境
- [x] 拥有完整的 `prompts.config.ts`
- [x] 拥有完整的 `core.logic.ts`
- [x] 拥有真实的 `config.local.ts`（含 API Key）

### ✅ GitHub Pages（gh-pages 分支）
- [x] 包含完整功能的混淆代码
- [x] 用户可以正常使用
- [x] Prompt 被编译进 JS，难以提取

---

## 🚀 日常开发流程

### 修改 Prompt

1. **编辑本地文件**：
   ```bash
   # 直接编辑 src/prompts.config.ts
   # 修改 generateDivinationPrompt 函数
   ```

2. **测试效果**：
   ```bash
   npm run dev
   # 在本地测试 AI 解卦效果
   ```

3. **部署到生产**：
   ```bash
   npm run deploy
   # 自动构建并推送到 gh-pages
   ```

4. **（可选）提交源码更改**：
   ```bash
   git add .
   git commit -m "feat: 更新功能"
   git push origin main
   # 注意：prompts.config.ts 不会被提交
   ```

---

## 📊 Prompt 效果对比

### 旧版 Prompt（简化）
```
【排盘结果】
* 大安宫：木、戌时、腾蛇、土 【父母】
...

【所问事项】：今日运势如何？

请进行分析。
```

### 新版 Prompt（专业）
```
【起卦信息】
* 问卦时间：2025年11月14日，午时
* 所问事项：今日运势如何？
* 自身宫位：空亡宫（金）

【排盘结果】
* 大安宫：木、戌时、腾蛇、土 【父母】
...

【解卦分析】
请严格按照以下结构分析，并结合问卦时间分析"应期"...

### 一、整体运势总论
（总体判断吉凶...）

### 二、自身宫位与主卦解读
（深入解读宫位含义，并分析应期...）

### 三、六亲关系与人际互动
（分析人际互动...）

### 四、五行生克与旺衰
（详细分析生克关系...）

### 五、最终建议与注意事项
* [吉] 趋吉建议：...
* [凶] 避凶指南：...
```

### 效果提升
- ✅ 更详细的背景信息
- ✅ 明确的分析结构
- ✅ 应期预测（时间维度）
- ✅ 更专业的术语和分析深度
- ✅ 清晰的格式化指令

---

## ⚠️ 注意事项

### 1. 首次设置
如果是新克隆的仓库，需要：
```bash
cp src/prompts.config.example.ts src/prompts.config.ts
# 然后编辑 prompts.config.ts 添加完整 prompt
```

### 2. 团队协作
如果有团队成员：
- 给他们提供完整的 `prompts.config.ts`（通过私密渠道）
- 不要通过 GitHub 传输
- 可以通过加密文件、私密消息等方式分享

### 3. 备份
建议定期备份以下文件（到安全位置）：
- `src/prompts.config.ts`
- `src/core.logic.ts`
- `src/config.local.ts`

---

## 🎯 下一步优化建议

### 短期（可选）
1. **A/B 测试不同 Prompt**：
   - 创建多个版本的 prompt
   - 对比 AI 回答质量
   - 选择最佳版本

2. **添加 Prompt 模板**：
   ```typescript
   const PROMPT_TEMPLATES = {
     fortune: '财运专用 prompt',
     love: '感情专用 prompt',
     career: '事业专用 prompt',
   };
   ```

### 长期（收费功能）
1. **Prompt 作为付费差异化**：
   - 免费版：基础 prompt
   - 付费版：专业 prompt（更详细、更准确）

2. **动态 Prompt 调整**：
   - 根据用户问题类型自动选择 prompt
   - 根据用户反馈持续优化

---

## ✅ 验证部署结果

### 1. 检查 GitHub（main 分支）
访问：https://github.com/AlyciaBHZ/mysterious/tree/main/src

应该**看不到**：
- ❌ `prompts.config.ts`
- ❌ `core.logic.ts`
- ❌ `config.local.ts`

应该**能看到**：
- ✅ `prompts.config.example.ts`
- ✅ `core.logic.example.ts`
- ✅ `config.local.example.ts`

### 2. 检查网站功能
访问：https://mysterious.lexaverse.dev

测试：
1. 输入 x1=5, x2=10，点击"开始排盘"
2. 应该看到完整的六宫格结果
3. 输入问题："今日财运如何？"
4. 点击"开始AI解卦"
5. 应该看到详细的解卦分析（包含应期、五行生克等）

---

## 🎉 总结

✅ **Prompt 已完全保护**：不会出现在 GitHub 上
✅ **功能完全正常**：用户可以获得专业解卦
✅ **易于维护**：本地修改即可，无需复杂操作
✅ **安全性高**：三层保护（config、logic、prompt）

现在你的小六壬项目已经具备：
- 🔐 核心算法保护
- 🔐 API Key 保护
- 🔐 专业 Prompt 保护
- ✅ 完整用户体验
- ✅ 简单的维护流程

**完美平衡了商业保护和用户体验！** 🎯

