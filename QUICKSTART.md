# 🚀 快速開始 - Bubble 應用

## 5 分鐘快速設置

### 第一步：克隆和安裝

```bash
# 進入項目目錄
cd /workspaces/INPAPP1

# 安裝所有依賴
npm install

# 如果 web 依賴未安裝
cd apps/web && npm install && cd ../..
```

### 第二步：啟動應用

#### 終端 1 - 啟動 API（端口 3000）
```bash
cd apps/api
npm run start:dev
```

你應該看到：
```
[Nest] 23576  - 12/09/2025, 11:41:42 AM     LOG [NestFactory] Starting Nest application...
...
[Nest] 23576  - 12/09/2025, 11:41:42 AM     LOG [NestApplication] Nest application successfully started
```

#### 終端 2 - 啟動前端（端口 5173）
```bash
cd apps/web
npm run dev
```

你應該看到：
```
  VITE v5.4.21  ready in 261 ms

  ➜  Local:   http://localhost:5173/
```

### 第三步：打開瀏覽器

訪問 http://localhost:5173

## 🎯 快速體驗

### 1. 首頁瀏覽
- 你應該看到 6 個示例影片卡片
- 每個卡片顯示標題、縮圖和最熱門留言

### 2. 登入
- 點擊導航欄的「登入」按鈕
- 輸入任何名稱（例如 "TestUser"）
- 點擊「登入」

### 3. 查看影片詳情
- 點擊任何影片卡片進入詳情頁
- 你可以看到：
  - 影片播放器（HTML5 video）
  - 影片統計 (觀看次數、讚數、留言數)
  - 三個標籤：留言 | 泡泡 | 推薦

### 4. 發表留言
- 在影片詳情頁點擊「留言」標籤
- 輸入你的想法
- 點擊「發送留言」

### 5. 查看相關群組
- 點擊「泡泡」標籤
- 看到與該影片相關的共學群組
- 群組顯示入群要求、進度和成員數

### 6. 加入群組
- 點擊任何群組進入群組頁
- 點擊「加入群組」
- 加入後可以看到：
  - 群組里程碑
  - 群組成員
  - 打卡功能

### 7. 打卡
- 在里程碑區輸入打卡內容（例如「完成第一章節」）
- 點擊「打卡」按鈕
- 你的打卡記錄會立即顯示

### 8. 查看推薦
- 回到影片詳情頁
- 點擊「推薦」標籤
- 看到基於標籤相似度的推薦影片

### 9. 訪問用戶頁
- 點擊任何影片的發布者名稱
- 進入用戶個人頁面
- 看到用戶發布的所有影片

## 📝 API 測試

如果你想直接測試 API：

### 使用 curl

```bash
# 獲取所有影片
curl http://localhost:3000/videos | jq

# 獲取第一個影片的詳情
curl http://localhost:3000/videos/vid-1 | jq

# 獲取所有用戶
curl http://localhost:3000/users | jq

# 發表留言
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "vid-1",
    "userId": "user-mia",
    "body": "很棒的影片！"
  }' | jq

# 加入群組
curl -X POST http://localhost:3000/groups/b-1/join \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-mia"}' | jq

# 添加打卡
curl -X POST http://localhost:3000/milestones/1/progress \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-mia",
    "note": "完成第一個里程碑"
  }' | jq
```

### 使用 Postman

1. 創建新的 Postman Collection
2. 添加以下請求：

| 方法 | URL | 描述 |
|------|-----|------|
| GET | http://localhost:3000/videos | 獲取所有影片 |
| GET | http://localhost:3000/videos/vid-1 | 獲取影片詳情 |
| POST | http://localhost:3000/comments | 發表留言 |
| POST | http://localhost:3000/groups/:id/join | 加入群組 |
| POST | http://localhost:3000/milestones/:id/progress | 打卡 |

## 🔄 數據庫管理

### 查看數據庫

```bash
cd apps/api
npx prisma studio
```

在瀏覽器打開 http://localhost:5555 可以查看和編輯所有數據

### 重置數據庫

```bash
cd apps/api
npx prisma migrate reset
```

⚠️ 這將刪除所有數據並重新創建種子數據

### 查看遷移歷史

```bash
cd apps/api
npx prisma migrate status
```

## 🐛 常見問題

### Q: 前端無法連接到 API
**A:** 確保：
- API 在 http://localhost:3000 運行
- 前端在 http://localhost:5173 運行
- 沒有防火牆阻止連接

### Q: 顯示「Database is locked」
**A:** SQLite 數據庫被鎖定：
```bash
# 停止所有 Node 進程
pkill -f node

# 刪除數據庫鎖文件
rm apps/api/dev.db-shm apps/api/dev.db-wal

# 重新啟動應用
```

### Q: 種子數據沒有加載
**A:** 嘗試重置數據庫：
```bash
cd apps/api
npx prisma migrate reset
```

### Q: 前端樣式不顯示
**A:** Tailwind CSS 可能未編譯：
```bash
cd apps/web
npm run dev
```

## 📚 下一步

1. **查看開發者指南**: [DEVELOPER.md](./DEVELOPER.md)
2. **閱讀完整 README**: [README.md](./README.md)
3. **探索代碼結構**: 查看 `apps/api/src` 和 `apps/web/src`

## 💡 提示

- API 變化會自動重新編譯（watch 模式）
- 前端文件變化會自動刷新（HMR）
- 數據庫模型改變時需要運行遷移

```bash
cd apps/api
npx prisma migrate dev --name your_migration_name
```

## 🎮 互動演示流程

1. **創建新用戶**
   - 登入為新用戶
   - 瀏覽影片

2. **參與共學**
   - 查看影片
   - 發表想法
   - 加入相關群組

3. **完成里程碑**
   - 在群組中設定目標
   - 打卡記錄進度
   - 看進度條上升

4. **發現推薦**
   - 基於已看影片
   - 系統推薦相似內容
   - 無限探索和學習

---

祝你使用愉快！🎉

有任何問題？檢查 API 終端的日誌或打開瀏覽器 DevTools 查看前端錯誤。
