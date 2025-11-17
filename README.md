# Sistine Starter: Vibe to Production

<div align="center">
  <h3>
    <a href="#english">English</a> |
    <a href="#中文">中文</a>
  </h3>
</div>

<div align="center">
  <h1>🚀 The First AI SaaS Starter Built for Vibe Coding</h1>
  <p>Ship production-ready AI SaaS products using Cursor, Claude Code, or Windsurf.</p>
  <p>No coding experience required. Just pure vibes.</p>
</div>

---

<a name="english"></a>
## 📖 English

### 🎯 What is Vibe Coding?

**Vibe Coding** is a revolutionary development approach where you describe what you want in plain language to AI coding assistants, and they write production-ready code for you. No traditional coding required.

With Sistine Starter, you can:
- 🎨 **Describe** features in plain English
- 🤖 **AI writes** production-ready code
- 🚢 **Ship** to real users in hours
- 💰 **Accept** payments immediately
- 📈 **Scale** to thousands of users

### ✨ Features

#### 🏗 Production-Ready Foundation
- **Authentication**: Better Auth with email/password and OAuth providers
- **Payments**: Creem integration with subscriptions and usage tracking
- **Database**: PostgreSQL + Drizzle ORM with type-safe queries
- **Deployment**: One-click deploy to Vercel, Railway, or any platform

#### 🤖 AI-Optimized Architecture
- Pre-configured for **Cursor**, **Claude Code**, and **Windsurf**
- Every component structured for AI understanding
- Google Gemini AI integration ready
- Optimized file structure for AI modifications

#### 🎨 Modern Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui - Beautiful, customizable components
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth - Simple, secure, and scalable
- **Payments**: Creem - Subscriptions, usage-based billing, and more
- **Styling**: Tailwind CSS + CSS-in-JS for maximum flexibility

#### 💳 Subscription Credit Scheduling
- Configure per-plan credit schedules via `constants/billing.ts`
- Annual plans can drip credits monthly using the built-in schedule utilities
- Secure cron endpoint at `/api/cron/subscription-grants` (basic auth via `CRON_JOBS_USERNAME/CRON_JOBS_PASSWORD` or bearer token)
- Detailed guide in `docs/billing-credits.md` (copy to your repo if `.gitignore` excludes docs)

### 🚀 Quick Start

#### Prerequisites
- Node.js 18+
- PostgreSQL database
- AI coding assistant (Cursor, Claude Code, or Windsurf)

#### Get Access

**申请 GitHub 仓库权限**: [https://applysistine.vercel.app/](https://applysistine.vercel.app/)

获得权限后，按照以下步骤开始：

#### Installation

1. **Clone the repository**
```bash
git clone https://github.com/liuxiaopai-ai/sistine-starter-vibe-to-production.git
cd sistine-starter-vibe-to-production
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Creem Payment (Optional)
CREEM_API_KEY="your-creem-api-key"
CREEM_WEBHOOK_SECRET="whsec_..."

# AI Providers (Optional)
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
```

4. **Set up the database**
```bash
pnpm db:push
```

5. **Start the development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

### 🎯 How to Vibe Code

1. **Open in your AI assistant**
   - Open the project in Cursor, Claude Code, or Windsurf

2. **Describe what you want**
   ```
   "Add a dashboard that shows user analytics with charts"
   "Create a blog system with MDX support"
   "Implement a referral program with rewards"
   ```

3. **Let AI do the work**
   - The AI understands the project structure
   - It writes production-ready code
   - All integrations work automatically

4. **Ship to production**
   ```bash
   pnpm build
   # Deploy to Vercel, Railway, etc.
   ```

### 📚 Documentation

- [Project Structure](./docs/structure.md)
- [Authentication Guide](./docs/auth.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)
- [AI Assistant Tips](./docs/ai-tips.md)

### 🛠 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:generate  # Generate Drizzle migrations
pnpm db:push      # Push schema to database
pnpm db:studio    # Open Drizzle Studio
```

### 🌟 Success Stories

> "I'm not a developer. I'm a marketer. But I shipped my AI SaaS in 3 days using Sistine + Cursor. Now making $5K MRR." - Marketing Manager turned Founder

> "From idea to $10K MRR in 2 months. All vibes, no code." - Serial Entrepreneur

> "Built and launched 3 different AI SaaS products this quarter alone. Vibe Coding with Sistine is my secret weapon." - Indie Hacker

### 🤝 Contributing

We love contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

<a name="中文"></a>
## 📖 中文

### 🎯 什么是 Vibe Coding？

**Vibe Coding** 是一种革命性的开发方式，你只需用自然语言向 AI 编程助手描述你想要的功能，AI 就会为你编写生产级代码。无需传统编程技能。

使用 Sistine Starter，你可以：
- 🎨 **描述**功能需求（用中文或英文）
- 🤖 **AI 编写**生产级代码
- 🚢 **发布**给真实用户（几小时内）
- 💰 **接受**付款（立即开始）
- 📈 **扩展**到数千用户

### ✨ 功能特性

#### 🏗 生产级基础设施
- **身份认证**：Better Auth 支持邮箱密码和 OAuth 登录
- **支付系统**：Creem 集成，支持订阅和用量计费
- **数据库**：PostgreSQL + Drizzle ORM，类型安全查询
- **部署**：一键部署到 Vercel、Railway 或任何平台

#### 🤖 AI 优化架构
- 为 **Cursor**、**Claude Code** 和 **Windsurf** 预配置
- 每个组件都为 AI 理解而结构化
- Google Gemini AI 集成就绪
- 为 AI 修改优化的文件结构

#### 🎨 现代技术栈
- **前端**：Next.js 14、TypeScript、Tailwind CSS
- **UI 组件**：shadcn/ui - 美观、可定制的组件
- **数据库**：PostgreSQL 配合 Drizzle ORM
- **认证**：Better Auth - 简单、安全、可扩展
- **支付**：Creem - 订阅、用量计费等
- **样式**：Tailwind CSS + CSS-in-JS 最大灵活性

### 🚀 快速开始

#### 前置要求
- Node.js 18+
- PostgreSQL 数据库
- AI 编程助手（Cursor、Claude Code 或 Windsurf）

#### 获取访问权限

**申请 GitHub 仓库权限**: [https://applysistine.vercel.app/](https://applysistine.vercel.app/)

获得权限后，按照以下步骤开始：

#### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/liuxiaopai-ai/sistine-starter-vibe-to-production.git
cd sistine-starter-vibe-to-production
```

2. **安装依赖**
```bash
pnpm install
# 或
npm install
```

3. **设置环境变量**
```bash
cp .env.example .env.local
```

编辑 `.env.local` 配置：
```env
# 数据库
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Creem 支付（可选）
CREEM_API_KEY="your-creem-api-key"
CREEM_WEBHOOK_SECRET="whsec_..."

# AI 提供商（可选）
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
```

4. **设置数据库**
```bash
pnpm db:push
```

5. **启动开发服务器**
```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看你的应用！

### 🎯 如何进行 Vibe Coding

1. **在 AI 助手中打开项目**
   - 在 Cursor、Claude Code 或 Windsurf 中打开项目

2. **描述你想要的功能**
   ```
   "添加一个显示用户分析图表的仪表板"
   "创建一个支持 MDX 的博客系统"
   "实现一个带奖励的推荐计划"
   ```

3. **让 AI 完成工作**
   - AI 理解项目结构
   - 它编写生产级代码
   - 所有集成自动工作

4. **发布到生产环境**
   ```bash
   pnpm build
   # 部署到 Vercel、Railway 等
   ```

### 📚 文档

- [项目结构](./docs/structure.md)
- [认证指南](./docs/auth.md)
- [数据库架构](./docs/database.md)
- [部署指南](./docs/deployment.md)
- [AI 助手技巧](./docs/ai-tips.md)

### 🛠 可用脚本

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 运行 ESLint
pnpm db:generate  # 生成 Drizzle 迁移
pnpm db:push      # 推送 schema 到数据库
pnpm db:studio    # 打开 Drizzle Studio
```

### 🌟 成功案例

> "我不是开发者，我是营销人员。但我用 Sistine + Cursor 在 3 天内发布了我的 AI SaaS。现在月收入 $5K。" - 营销经理转型创始人

> "从想法到月收入 $10K 只用了 2 个月。全靠 Vibe，没写代码。" - 连续创业者

> "仅这个季度就构建并发布了 3 个不同的 AI SaaS 产品。Sistine 的 Vibe Coding 是我的秘密武器。" - 独立开发者

### 🤝 贡献

我们欢迎贡献！详情请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)。

### 📄 许可证

MIT 许可证 - 详情见 [LICENSE](./LICENSE)。

---

<div align="center">
  <h3>🚀 Start Vibe Coding Today!</h3>
  <p>
    <a href="https://github.com/liuxiaopai-ai/sistine-starter-vibe-to-production">GitHub</a> •
    <a href="https://raphael.app">Website</a> •
    <a href="https://twitter.com/bourneliu66">Twitter</a>
  </p>
  <p>Made with ❤️ by <a href="https://sistine.ai">Sistine AI</a> & Sistine Labs</p>
</div>
