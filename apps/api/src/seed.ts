import { Prisma, PrismaClient } from '@prisma/client';

type SeedGroup = {
  id: string;
  title: string;
  goal?: string;
  memberCount: number;
  progress: number;
  requirements: string[];
  milestones: string[];
};

const seedUsers = [
  { id: 'user-mia', name: 'Mia Chen', avatar: null },
  { id: 'user-ada', name: 'Ada Kuo', avatar: null },
  { id: 'user-leo', name: 'Leo', avatar: null },
  { id: 'user-rin', name: 'Rin', avatar: null },
  { id: 'user-eason', name: 'Eason', avatar: null },
  { id: 'user-sherry', name: 'Sherry', avatar: null },
  { id: 'user-ivan', name: 'Ivan', avatar: null },
];

const seedVideos = [
  {
    id: 'vid-1',
    title: '30 天搞定 React 進階：從 hooks 到性能優化',
    description: '進階 React 心法與性能優化示例',
    playbackUrl: 'https://stream.mux.com/demo.m3u8',
    thumbnail:
      'https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80',
    durationSec: 12 * 60 + 48,
    tags: ['前端', 'React', '性能'],
    views: 12400,
    likes: 980,
    commentsCount: 182,
    authorId: 'user-mia',
  },
  {
    id: 'vid-2',
    title: 'AI 助攻的自我學習：如何設計高效筆記系統',
    description: '卡片盒筆記搭配 AI 摘要的實戰經驗',
    playbackUrl: 'https://stream.mux.com/demo.m3u8',
    thumbnail:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    durationSec: 10 * 60 + 21,
    tags: ['學習策略', 'AI', '筆記'],
    views: 8600,
    likes: 530,
    commentsCount: 94,
    authorId: 'user-ada',
  },
];

const seedComments = [
  {
    id: 'c-1',
    userId: 'user-leo',
    videoId: 'vid-1',
    body: '第 8 分鐘那段 useMemo 心得太實用，直接省掉 40% 重算時間！',
    likes: 211,
  },
  {
    id: 'c-2',
    userId: 'user-rin',
    videoId: 'vid-1',
    body: '我把 concurrent features 套在 side project，首屏速度快超多。',
    likes: 97,
  },
  {
    id: 'c-3',
    userId: 'user-eason',
    videoId: 'vid-1',
    body: '感謝示範 profiler，用之前都沒找到瓶頸點。',
    likes: 54,
  },
  {
    id: 'c-21',
    userId: 'user-sherry',
    videoId: 'vid-2',
    body: '卡片盒筆記搭配 AI 摘要真的提高回憶率，已經用到研究上。',
    likes: 134,
  },
  {
    id: 'c-22',
    userId: 'user-ivan',
    videoId: 'vid-2',
    body: '好奇實作工具鏈？Obsidian + GPT 還是 Notion AI？',
    likes: 61,
  },
];

const seedGroups: SeedGroup[] = [
  {
    id: 'b-1',
    title: 'React 性能優化衝刺營',
    goal: '把既有專案 TTFB 壓到 1s 內',
    memberCount: 42,
    progress: 60,
    requirements: ['vid-1'],
    milestones: ['完成 profiling 報告', '實作 memoization', '導入 lazy loading'],
  },
  {
    id: 'b-2',
    title: '前端面試 30 天',
    goal: '完成 10 題系統設計 + 20 題 JS 手寫題',
    memberCount: 88,
    progress: 35,
    requirements: ['vid-1'],
    milestones: ['刷完 hooks 章節', '整理高頻八股', '模擬面試 2 回'],
  },
  {
    id: 'b-3',
    title: '學習系統共建小組',
    goal: '打造個人知識庫並每週複盤',
    memberCount: 51,
    progress: 72,
    requirements: ['vid-2'],
    milestones: ['建立收斂模板', '完成 3 次複盤', '分享一次心得'],
  },
  {
    id: 'b-4',
    title: 'AI 筆記自動化',
    goal: '實作自動摘要 + 關鍵句抽取',
    memberCount: 33,
    progress: 40,
    requirements: ['vid-2'],
    milestones: ['完成 prompt 範本', '串接資料來源', '驗證準確率'],
  },
];

export async function seedDatabase(prisma: any) {
  const hasVideos = await prisma.video.count();
  if (hasVideos > 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.user.createMany({ data: seedUsers });

    for (const video of seedVideos) {
      await tx.video.create({
        data: {
          ...video,
          tags: JSON.stringify(video.tags),
        },
      });
    }

    await tx.comment.createMany({ data: seedComments });

    for (const group of seedGroups) {
      await tx.group.create({
        data: {
          id: group.id,
          title: group.title,
          goal: group.goal,
          memberCount: group.memberCount,
          progress: group.progress,
        },
      });

      // seed members (simple distribution)
      await tx.groupMember.createMany({
        data: seedUsers.slice(0, 3).map((u) => ({
          userId: u.id,
          groupId: group.id,
          status: 'joined',
        })),
      });

      await tx.groupRequirement.createMany({
        data: group.requirements.map((videoId) => ({
          groupId: group.id,
          videoId,
        })),
      });

      await tx.milestone.createMany({
        data: group.milestones.map((title) => ({
          title,
          groupId: group.id,
        })),
      });
    }
  });
}

