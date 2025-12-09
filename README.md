# Bubble - 自我實現共學軟體

一個現代化的共學平台，幫助用戶透過影片、留言、群組和打卡機制實現自我成長目標。

## 📱 核心功能

### 1. 影片瀏覽（主軸流）
- **主頁流覽**: 類似 Twitter/Threads 的卡片式瀏覽
- **影片卡片**: 展示標題、縮圖和最熱門留言
- **影片詳情**: 點進後可看完整影片和相關信息

### 2. 互動功能（留言、泡泡、推薦）
- **留言系統**: 發表、點讚、回覆留言
- **泡泡（群組）**: 根據影片顯示相關共學群組
- **推薦系統**: 基於標籤和觀看記錄的影片推薦

### 3. 共學群組（泡泡）
- **入群要求**: 需觀看 1-5 個先備影片
- **里程碑與打卡**: 成員可自行切分里程碑並打卡
- **進度追蹤**: 即時查看群組進度和成員貢獻

### 4. 用戶個人頁面
- **個人資料**: 展示用戶發布的影片
- **群組管理**: 查看加入的群組和進度
- **收藏管理**: 管理收藏的影片和群組

## 🏗️ 技術架構

### 後端 (NestJS + Prisma)
```
apps/api/
├── src/
│   ├── videos/          # 影片管理
│   ├── comments/        # 留言系統
│   ├── groups/          # 群組管理
│   ├── users/           # 用戶管理
│   ├── prisma.service.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma    # 數據庫模型
│   └── migrations/      # 數據庫遷移
└── package.json
```

### 前端 (React + TypeScript + Tailwind)
```
apps/web/
├── src/
│   ├── pages/           # 頁面組件
│   ├── components/      # 可復用組件
│   ├── store/           # 狀態管理 (Zustand)
│   ├── api/             # API 通訊層
│   └── App.tsx          # 主應用
├── vite.config.ts
└── package.json
```

## 🚀 快速開始

### 前置要求
- Node.js 16+ 
- npm 或 yarn

### 安裝依賴

```bash
# 在根目錄運行
npm install
```

### 啟動開發伺服器

#### 方式 1：同時運行前後端
```bash
# 終端 1 - 啟動 API
cd apps/api
npm run start:dev

# 終端 2 - 啟動前端
cd apps/web
npm run dev
```

#### 方式 2：使用根目錄的 npm scripts
```bash
# 終端 1
npm run dev:api

# 終端 2
npm run dev:web
```

### 訪問應用

- **前端**: http://localhost:5173
- **API**: http://localhost:3000
- **API 文檔**: 使用 Postman 或 curl 測試

## 📊 數據模型

### 核心實體

1. **User** - 用戶
   - 基本信息: name, avatar, bio, email
   - 關聯: videos, comments, favorites, groups

2. **Video** - 影片
   - 元數據: title, description, playbackUrl, thumbnail
   - 統計: views, likes, commentsCount
   - 關聯: author, comments, requirements (群組要求)

3. **Comment** - 留言
   - 內容: body, likes
   - 結構: 支持嵌套回覆 (parentId)
   - 關聯: video, user

4. **Group** - 共學群組
   - 信息: title, description, goal, progress
   - 關聯: requirements (先備影片), milestones, members

5. **Milestone** - 里程碑
   - 任務: title, description, status, targetDate
   - 進度: progressEntries (成員打卡記錄)

6. **Favorite** - 收藏
   - 支持收藏影片或群組 (targetType)

## 🔌 API 端點

### 影片
```
GET    /videos                  # 獲取所有影片
POST   /videos                  # 創建影片
GET    /videos/:id              # 獲取影片詳情
GET    /videos/recommendations  # 推薦影片
```

### 留言
```
GET    /comments                # 獲取留言列表
POST   /comments                # 發表留言
DELETE /comments/:id            # 刪除留言
POST   /comments/:id/like       # 點讚
POST   /comments/:id/unlike     # 取消點讚
```

### 群組
```
GET    /groups                  # 獲取所有群組
POST   /groups                  # 創建群組
GET    /groups/:id              # 獲取群組詳情
POST   /groups/:id/join         # 加入群組
POST   /groups/:id/leave        # 離開群組
POST   /groups/:id/milestones   # 添加里程碑
```

### 用戶
```
GET    /users                   # 獲取所有用戶
POST   /users                   # 創建用戶
GET    /users/:id               # 獲取用戶詳情
POST   /users/:id/favorites     # 添加收藏
DELETE /users/:id/favorites/:type/:id  # 刪除收藏
POST   /users/:id/watch         # 記錄觀看
GET    /users/:id/watch-history # 獲取觀看歷史
```

## 🗄️ 數據庫

使用 SQLite 作為開發數據庫，配合 Prisma ORM。

### 遷移
```bash
# 應用遷移
npx prisma migrate dev

# 重置數據庫
npx prisma migrate reset

# 查看數據庫狀態
npx prisma studio
```

## 📦 種子數據

應用會在首次使用時自動創建種子數據：
- 7 個示例用戶
- 6 個示例影片（帶留言）
- 4 個示例群組（帶里程碑）

## 🛠️ 開發指南

### 添加新 API 端點

1. 在對應的 service 中添加方法
2. 在對應的 controller 中添加路由
3. 在 Prisma schema 中更新模型（如需要）
4. 運行遷移

### 前端狀態管理

使用 Zustand 進行狀態管理：

```typescript
// store/auth.ts
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
}));
```

### API 通訊

```typescript
// api/index.ts
export const videosAPI = {
  getAll: (limit?: number) => apiClient.get('/videos', { params: { limit } }),
  getById: (id: string) => apiClient.get(`/videos/${id}`),
  // ...
};
```

## 🎨 UI 組件

使用 Tailwind CSS 構建響應式設計。主要組件：

- `Navigation` - 導航欄
- `HomePage` - 首頁影片流
- `VideoPage` - 影片詳情頁
- `GroupPage` - 群組詳情頁
- `UserPage` - 用戶個人頁
- `CommentSection` - 留言區域
- `GroupSection` - 相關群組區域

## 📝 環境變數

### API (.env)
```
DATABASE_URL=file:./dev.db
PORT=3000
```

### Web (.env)
```
VITE_API_URL=http://localhost:3000
```

## 🔐 安全注意事項

- 當前使用簡單的本地登入（演示用）
- 生產環境需實現：
  - JWT 認證
  - API 密鑰驗證
  - HTTPS
  - CORS 配置
  - 數據驗證和消毒

## 🚢 部署

### API 部署 (例: Railway, Render)
```bash
npm run build
npm start
```

### Web 部署 (例: Vercel, Netlify)
```bash
npm run build
# 部署 dist/ 目錄
```

## 📈 效能優化

- 影片推薦基於標籤相似度
- 觀看記錄追蹤用於個性化推薦
- 群組成員計數緩存
- 懶加載影片列表

## 🤝 貢獻

歡迎提交 Issues 和 Pull Requests！

## 📄 授權

MIT License

---

**更新日期**: 2025-12-09
**版本**: 0.1.0
