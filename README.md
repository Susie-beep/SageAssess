# 赛思国际英语教育｜Sage 雅思入学评测系统 (Sage Assessment)

赛思国际英语教育（Sage International Education）雅思学术入学评测与教学诊断系统。包含听、说、读、写标准短测、AI初始诊断草案、教师独占认领复核机制与官方四维诊断综合报告。

---

## Cloudflare Pages 部署说明

本项目为标准的现代 React + Vite 纯静态单页应用（SPA），已针对 **Cloudflare Pages** 进行完整适配：

### 1. 自动重写与缓存配置
- `public/_redirects`：已配置 SPA 重定向规则（`/* /index.html 200`），保证用户在任何子路径刷新或分享链接时不报 404。
- `public/_headers`：已配置安全标头（Security Headers）与静态资源持久缓存（Immutable Cache）。

---

### 2. Cloudflare Pages 仪表盘配置参数

在 Cloudflare 控制台连接 GitHub 仓库后，填写以下参数即可一键部署：

| 配置项 | 填写内容 |
| :--- | :--- |
| **Framework preset (框架预设)** | `Vite` |
| **Build command (构建命令)** | `npm run build` |
| **Build output directory (输出目录)** | `dist` |
| **Root directory (根目录)** | `/` (留空即可) |
| **Node.js Version (环境变量)** | `NODE_VERSION: 20` (可选推荐) |

---

### 3. 本地开发与构建

```bash
# 安装依赖
npm install

# 启动本地开发服务
npm run dev

# 编译打包 (生成 dist 静态目录)
npm run build

# 本地预览编译后的静态页面
npm run preview
```
