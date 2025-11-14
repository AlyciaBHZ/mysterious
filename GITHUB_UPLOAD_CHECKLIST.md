# ✅ GitHub上传清单

## 📋 上传前检查

在将代码推送到GitHub之前，请确认以下事项：

---

### 1. 私有文件保护 ✅

#### 已加入 `.gitignore` 的文件：

- ✅ `src/config.local.ts` - API Key配置
- ✅ `src/core.logic.ts` - 核心排盘算法

#### 验证方法：

```bash
# 查看git状态
git status

# 确认以上文件不在"Untracked files"或"Changes to be committed"中
```

---

### 2. 示例文件完整 ✅

#### 已创建的示例文件：

- ✅ `src/config.local.example.ts` - API配置示例
- ✅ `src/core.logic.example.ts` - 算法接口示例

#### 这些文件的作用：

- 告诉开发者文件结构
- 提供接口定义参考
- 说明这是部分开源项目

---

### 3. 文档完整 ✅

#### 已创建的文档：

- ✅ `LICENSE` - 许可协议（部分开源）
- ✅ `README_OPENSOURCE.md` - 详细项目说明
- ✅ `HOW_TO_USE.md` - 使用指南
- ✅ `DEPLOYMENT_GUIDE.md` - 部署指南（私有）
- ✅ `GITHUB_UPLOAD_CHECKLIST.md` - 本清单

#### 文档用途：

- 说明项目定位
- 指导用户使用
- 保护知识产权
- 吸引合作机会

---

### 4. 代码重构 ✅

#### 已完成的重构：

- ✅ 核心算法提取到 `core.logic.ts`
- ✅ 类型定义提取到 `types.ts`
- ✅ `App.tsx` 改为导入核心函数
- ✅ 移除了硬编码的算法实现

---

## 🚀 上传步骤

### 步骤 1：最后检查

```bash
# 确认当前目录
pwd
# 应该在 mysterious/ 目录下

# 查看git状态
git status

# 应该看到类似这样的输出：
# On branch main
# Untracked files:
#   GITHUB_UPLOAD_CHECKLIST.md
#   HOW_TO_USE.md
#   LICENSE
#   README_OPENSOURCE.md
#   src/core.logic.example.ts
#   src/config.local.example.ts
#   src/types.ts
#   ...
#
# 不应该看到：
#   src/core.logic.ts
#   src/config.local.ts
```

### 步骤 2：创建GitHub仓库（如果还没有）

1. 访问 https://github.com/new
2. 仓库名: `mysterious`
3. 描述: `小六壬快速排盘 - 传统文化与现代AI的结合`
4. 可见性: **Public**
5. 不要初始化README（我们已经有了）
6. 点击"Create repository"

### 步骤 3：连接远程仓库

```bash
# 如果还没有初始化git
git init

# 添加远程仓库
git remote add origin https://github.com/你的用户名/mysterious.git

# 或者如果已经有remote，更新它
git remote set-url origin https://github.com/你的用户名/mysterious.git
```

### 步骤 4：添加文件并提交

```bash
# 添加所有文件（私有文件会被自动忽略）
git add .

# 提交
git commit -m "feat: 小六壬排盘工具 - 部分开源版本

- 完整的UI/UX实现
- AI智能解卦集成
- 核心算法保护
- 详细文档和使用指南"

# 推送到GitHub
git push -u origin main
```

### 步骤 5：在GitHub上验证

1. 访问你的仓库页面
2. 确认 `README_OPENSOURCE.md` 显示正常
3. 确认 **不存在** `src/core.logic.ts`
4. 确认 **不存在** `src/config.local.ts`
5. 确认存在 `src/core.logic.example.ts`
6. 确认存在 `LICENSE` 文件

---

## 📖 上传后配置

### 1. 更新主README

将 `README_OPENSOURCE.md` 内容复制到 `README.md`：

```bash
# 备份原README（如果需要）
mv README.md README_old.md

# 使用新README
cp README_OPENSOURCE.md README.md

# 提交更新
git add README.md
git commit -m "docs: 更新README为开源版本"
git push
```

### 2. 配置GitHub Pages

1. 访问仓库的 **Settings**
2. 点击左侧的 **Pages**
3. Source选择: **Deploy from a branch**
4. Branch选择: `gh-pages` + `/ (root)`
5. 点击 **Save**

### 3. 配置自定义域名（可选）

如果你有自定义域名：

1. 在GitHub Pages设置中填入域名
2. 确保 `public/CNAME` 文件包含你的域名
3. 在域名DNS设置中添加CNAME记录

---

## 🔒 安全验证

### 最终安全检查：

```bash
# 1. 克隆你刚上传的仓库到新目录
cd /tmp
git clone https://github.com/你的用户名/mysterious.git test-clone
cd test-clone

# 2. 查看文件列表
ls -la src/

# 3. 确认不存在以下文件：
# ❌ src/core.logic.ts
# ❌ src/config.local.ts

# 4. 确认存在以下文件：
# ✅ src/core.logic.example.ts
# ✅ src/config.local.example.ts

# 5. 尝试安装和运行
npm install
npm run dev

# 6. 预期结果：
# - 可以正常启动
# - UI界面显示正常
# - 排盘功能不工作（这是预期的）
# - 控制台显示警告信息
```

---

## 📝 后续维护

### 日常更新流程：

```bash
# 1. 修改代码（UI、文档等）
# 2. 测试
npm run dev

# 3. 提交
git add .
git commit -m "描述你的改动"
git push

# 4. GitHub Actions会自动部署
```

### 核心算法更新：

⚠️ **重要**: 核心算法更新不会自动同步到GitHub

1. 在本地修改 `src/core.logic.ts`
2. 完整测试
3. 手动构建和部署到生产环境
4. GitHub仓库保持不变（不包含核心算法）

---

## ✅ 完成确认

上传完成后，你应该有：

- ✅ GitHub上的公开仓库（不含核心算法）
- ✅ 完整的文档和使用说明
- ✅ 清晰的许可协议
- ✅ 本地完整版本（包含核心算法）
- ✅ 自动化的部署流程

**恭喜！你的项目已成功配置为"部分开源"模式！** 🎉

---

## 🆘 遇到问题？

### 如果私有文件被上传了：

```bash
# 1. 立即从仓库中删除
git rm --cached src/core.logic.ts
git rm --cached src/config.local.ts

# 2. 提交删除
git commit -m "fix: 移除私有文件"

# 3. 强制推送
git push origin main --force

# 4. 如果API Key泄露，立即吊销并生成新的
```

### 如果需要帮助：

参考以下文档：
- [HOW_TO_USE.md](HOW_TO_USE.md) - 使用指南
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - 部署指南
- GitHub文档：https://docs.github.com/

---

<div align="center">

**准备好上传到GitHub了吗？** 

确认清单后，执行步骤4！🚀

</div>

