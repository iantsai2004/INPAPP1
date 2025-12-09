# Bubble 開發者指南

## 目錄結構詳解

```
INPAPP1/
├── apps/
│   ├── api/                 # NestJS 後端應用
│   │   ├── src/
│   │   │   ├── videos/      # 影片模塊 (Videos Service/Controller)
│   │   │   ├── comments/    # 留言模塊 (Comments Service/Controller)
│   │   │   ├── groups/      # 群組模塊 (Groups Service/Controller)
│   │   │   ├── users/       # 用戶模塊 (Users Service/Controller)
│   │   │   ├── app.module.ts        # 主模塊
│   │   │   ├── main.ts              # 入口點
│   │   │   ├── prisma.service.ts    # Prisma 服務
│   │   │   └── seed.ts              # 種子數據
│   │   ├── prisma/
│   │   │   ├── schema.prisma        # 數據庫模型定義
│   │   │   └── migrations/          # 遷移歷史
│   │   ├── .env                     # 環境變數
│   │   └── package.json
│   │
│   └── web/                 # React 前端應用
│       ├── src/
│       │   ├── pages/
│       │   │   ├── HomePage.tsx     # 首頁 - 影片流
│       │   │   ├── VideoPage.tsx    # 影片詳情
│       │   │   ├── GroupPage.tsx    # 群組詳情
│       │   │   ├── GroupsPage.tsx   # 群組瀏覽
│       │   │   └── UserPage.tsx     # 用戶個人頁
│       │   ├── components/
│       │   │   ├── Navigation.tsx   # 導航欄
│       │   │   ├── VideoPlayer.tsx  # 影片播放器
│       │   │   ├── CommentSection.tsx # 留言區
│       │   │   └── GroupSection.tsx # 群組區
│       │   ├── store/
│       │   │   └── auth.ts          # Zustand 狀態管理
│       │   ├── api/
│       │   │   └── index.ts         # Axios API 客戶端
│       │   ├── App.tsx              # 主應用
│       │   ├── main.tsx             # 入口點
│       │   └── index.css            # Tailwind 樣式
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
├── package.json             # 根目錄 monorepo 配置
└── README.md
```

## 模塊詳解

### 1. Videos 模塊

**Videos Service** (`videos.service.ts`)
- `findAll()` - 獲取所有影片（帶分頁和排序）
- `findOne(id)` - 獲取單個影片的完整信息
- `findComments(videoId)` - 獲取影片留言
- `findBubbles(videoId)` - 獲取與該影片相關的群組
- `recommendations(baseVideoId)` - 生成推薦影片（基於標籤相似度）
- `create(data)` - 創建新影片
- `parseTags(tags)` - 解析標籤 JSON

**Videos Controller** (`videos.controller.ts`)
- 路由映射上述服務方法

### 2. Comments 模塊

**Comments Service** (`comments.service.ts`)
- `create(data)` - 發表留言
- `findAll(videoId)` - 獲取留言列表
- `findOne(id)` - 獲取單個留言
- `delete(id)` - 刪除留言
- `like(commentId, userId)` - 點讚
- `unlike(commentId, userId)` - 取消點讚

**Comments Controller** (`comments.controller.ts`)
- 暴露留言相關 API 端點

### 3. Groups 模塊

**Groups Service** (`groups.service.ts`)
- `findAll()` - 獲取所有群組
- `findOne(id)` - 獲取群組詳情（包含成員和里程碑）
- `create(data)` - 創建新群組
- `joinGroup(groupId, userId)` - 加入群組
- `leaveGroup(groupId, userId)` - 離開群組
- `addMilestone(groupId, data)` - 添加里程碑
- `updateMilestoneStatus(milestoneId, status)` - 更新里程碑狀態
- `addProgressEntry(milestoneId, userId, note)` - 打卡/記錄進度

**Groups Controller** (`groups.controller.ts`)
- 映射群組相關路由

### 4. Users 模塊

**Users Service** (`users.service.ts`)
- `findAll()` - 獲取所有用戶
- `findOne(id)` - 獲取用戶詳情和發布的影片
- `create(data)` - 創建新用戶
- `update(userId, data)` - 更新用戶信息
- `addFavorite()` - 添加收藏
- `removeFavorite()` - 移除收藏
- `recordWatch(userId, videoId)` - 記錄觀看
- `getWatchHistory(userId)` - 獲取觀看歷史

**Users Controller** (`users.controller.ts`)
- 用戶相關 API 路由

## 數據庫模型關係圖

```
User
├── videos (1:N) → Video
├── comments (1:N) → Comment
├── groupMembers (1:N) → GroupMember
├── watchHistory (1:N) → WatchHistory
├── commentLikes (1:N) → CommentLike
└── favorites (1:N) → Favorite

Video
├── comments (1:N) → Comment
├── requirements (1:N) → GroupRequirement
├── author (N:1) ← User
└── watchHistory (1:N) → WatchHistory

Group
├── members (1:N) → GroupMember
├── requirements (1:N) → GroupRequirement
└── milestones (1:N) → Milestone

Milestone
└── progressEntries (1:N) → ProgressEntry
    └── user (N:1) ← User

Comment
├── video (N:1) ← Video
├── user (N:1) ← User
├── replies (1:N) → Comment (自引用)
├── parent (N:1) ← Comment (自引用)
└── likedBy (1:N) → CommentLike
```

## 前端頁面流程

### 首頁 → 影片詳情 → 留言/泡泡/推薦

```
HomePage (影片列表)
  ↓ 點擊影片卡片
VideoPage (影片詳情)
  ├─ 留言標籤 → CommentSection
  ├─ 泡泡標籤 → GroupSection
  └─ 推薦標籤 → RecommendationSection

GroupSection (點擊群組) → GroupPage
UserPage (點擊用戶名或頭像) → UserPage
```

## 關鍵工作流

### 1. 發表留言工作流

```
CommentSection
  ↓ 用戶輸入留言
  ↓ 點擊發送按鈕
commentsAPI.create()
  ↓ API POST /comments
CommentsService.create()
  ↓ Prisma 創建記錄
Comment 記錄在數據庫中
  ↓ 返回新留言
UI 更新，刷新留言列表
```

### 2. 加入群組工作流

```
GroupPage
  ↓ 點擊加入群組按鈕
groupsAPI.join()
  ↓ API POST /groups/:id/join
GroupsService.joinGroup()
  ↓ 創建 GroupMember 記錄
  ↓ 更新 Group.memberCount
成功加入，頁面刷新顯示群組內容
```

### 3. 打卡工作流

```
GroupPage (里程碑區)
  ↓ 輸入打卡內容
  ↓ 點擊打卡按鈕
groupsAPI.addProgressEntry()
  ↓ API POST /milestones/:id/progress
GroupsService.addProgressEntry()
  ↓ 創建 ProgressEntry 記錄
打卡記錄顯示，計數增加
```

## 常見開發任務

### 添加新的影片字段

1. **更新 Prisma Schema**
```prisma
model Video {
  // ... 現有字段
  newField    String?    // 新字段
}
```

2. **創建遷移**
```bash
npx prisma migrate dev --name add_new_field
```

3. **更新 Videos Service**
```typescript
// 在 mapVideo() 中添加
newField: video.newField,

// 在 create() 中處理
data: {
  ...otherData,
  newField: data.newField,
}
```

4. **更新前端 API**
```typescript
// api/index.ts
videosAPI.getById: (id) => 
  // 會自動包含新字段
```

### 添加新的 API 路由

1. **Service 中添加方法**
```typescript
async myNewMethod(params) {
  return this.prisma.model.method(...);
}
```

2. **Controller 中添加路由**
```typescript
@Post('/my-route')
myRoute(@Body() body: any) {
  return this.service.myNewMethod(body);
}
```

3. **前端 API 層添加**
```typescript
export const modelAPI = {
  myMethod: (params) => 
    apiClient.post('/my-route', params),
};
```

4. **組件中調用**
```typescript
const result = await modelAPI.myMethod(data);
```

## 調試技巧

### 查看 API 日誌
在 API 終端可以看到所有請求/響應日誌

### 查看數據庫
```bash
npx prisma studio
# 在 http://localhost:5555 打開數據庫 UI
```

### 前端調試
使用 React DevTools 檢查組件狀態和 Zustand store

### 網絡調試
使用瀏覽器 DevTools 的 Network 標籤檢查 API 請求

## 性能優化建議

1. **API 層面**
   - 添加數據庫索引
   - 實現分頁和無限滾動
   - 使用緩存策略

2. **前端層面**
   - 實現虛擬列表（大量影片）
   - 圖片懶加載
   - 代碼分割

3. **數據庫層面**
   - 定期備份
   - 查詢優化
   - 歸檔舊數據

## 測試

### API 單元測試
```bash
npm run test
```

### E2E 測試
```bash
npm run test:e2e
```

### 前端單位測試
可以添加 Jest + React Testing Library

## 部署檢清單

- [ ] 環境變數配置正確
- [ ] 數據庫遷移已應用
- [ ] API 編譯成功
- [ ] 前端編譯成功
- [ ] CORS 配置完成
- [ ] 日誌系統設置
- [ ] 監控告警配置
- [ ] 備份策略確定

---

**最後更新**: 2025-12-09
