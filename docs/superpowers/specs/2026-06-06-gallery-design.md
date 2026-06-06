# 图片画廊功能设计

## 背景

Android WebView 中现有的图片导出功能（dom-to-image 生成 → blob URL 下载）存在兼容性问题，反复修复效果不佳。用户提出换一种方式：新增一个独立的"图片画廊"页面，日记/周报点击导出后，内容存储到画廊，用户在画廊中查看 4K 渲染图并长按保存。

## 核心目标

1. 解决 Android 端图片导出不可用的问题
2. 提供一个统一的图片查看和保存入口
3. 4K 超高清画质输出

## 数据结构

### 存储方式

localStorage key: `parallel-universe-gallery`

```typescript
type GalleryItem = {
  id: string;                    // 唯一ID (crypto.randomUUID)
  type: "diary" | "weekly";     // 内容类型
  title: string;                 // 标题，如 "2026-06-06 日记" 或 "2026-W23 周报"
  content: string;               // 正文内容 (markdown)
  rawContent?: string;           // 原始内容（日记 AI 加工前），用于对比显示
  style?: string;                // 日记风格 (newspaper/chronicle/prose)，仅日记类型
  processMode?: string;          // 加工模式 (none/tone/absurd/both)
  date: string;                  // 日期 (YYYY-MM-DD) 或周数 (YYYY-WXX)
  createdAt: number;             // 导出时间戳
};
```

### CRUD 操作 (`src/lib/gallery.ts`)

- `loadGalleryItems(): GalleryItem[]` — 读取所有画廊记录
- `saveGalleryItems(items: GalleryItem[]): void` — 保存整个画廊数组
- `addToGallery(item: Omit<GalleryItem, "id" | "createdAt">): GalleryItem` — 添加新记录
- `removeFromGallery(id: string): void` — 删除记录
- `clearGallery(): void` — 清空画廊

### 备份集成

画廊数据随现有的备份/恢复功能一起导出导入。在 Settings 页面的 `handleExport` 和 `handleImport` 中加入 `parallel-universe-gallery` key。

## 页面设计

### 路由

- 路径: `/gallery`
- 文件: `src/app/gallery/page.tsx` + `src/app/gallery/gallery-client.tsx`

### 画廊列表页

布局：2列卡片网格，按导出时间倒序排列。

每张卡片显示：
- 类型标签（日记/周报）
- 标题（日期或周数）
- 风格标签（仅日记：报纸风/编年风/散文风）
- 导出时间
- 删除按钮（hover/长按显示）

空状态：居中提示"还没有导出的内容，去日记或周报页面导出吧"

### 4K 图片预览页

路径: `/gallery/[id]`
文件: `src/app/gallery/[id]/page.tsx` + `src/app/gallery/[id]/preview-client.tsx`

布局：
- 顶部：返回按钮 + 标题
- 主体：实时渲染的 4K 图片（dom-to-image-more）
- 底部：删除按钮 + 分享按钮

渲染参数：
- `pixelRatio: 4`（输出宽度 3840px+）
- `quality: 1.0`（JPEG 最高质量）
- `backgroundColor: "#000000"`

加载状态：显示渲染进度动画（复用现有的 GeneratingState 样式）

### 图片保存机制

渲染完成后，将图片显示为 `<img src={dataUrl}>`。用户通过浏览器原生的长按图片 → 保存到相册来保存。这种方式不依赖 blob 下载，在 Android WebView 中更可靠。

## 导航入口

### 桌面端 (`src/components/desktop-nav.tsx`)

在顶部导航栏右侧（现有日期/周数标签旁边）添加画廊图标按钮（Image icon from lucide-react）。点击跳转到 `/gallery`。

### 移动端

移动端已有顶部栏（在各个页面中），在顶部栏右侧添加画廊图标。不占用底部导航栏空间。

## 导出流程改动

### 日记页面 (`src/components/diary/diary-content.tsx`)

将现有的"导出长图"按钮改为"保存到画廊"：
1. 点击后，将日记的 content、rawContent、style、date 等数据存入 localStorage（`parallel-universe-gallery`）
2. 跳转到 `/gallery` 页面
3. Toast 提示"已保存到画廊"

移除现有的 dom-to-image 导出逻辑和相关的 WebView 检测代码。

### 周报页面 (`src/components/weekly/weekly-report.tsx`)

将现有的"导出图片"按钮改为"保存到画廊"：
1. 点击后，将周报数据序列化为 JSON 字符串存入 `content` 字段（包含 summary、highlights、stats、dailyEntries 等）
2. 跳转到 `/gallery` 页面
3. Toast 提示"已保存到画廊"
4. 预览页渲染时解析 JSON 并用现有的 WeeklyReportDisplay 组件渲染

移除现有的 dom-to-image 导出逻辑。

## 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/lib/gallery.ts` | 新增 | 画廊数据 CRUD |
| `src/app/gallery/page.tsx` | 新增 | 画廊页面路由 |
| `src/app/gallery/gallery-client.tsx` | 新增 | 画廊列表客户端逻辑 |
| `src/components/gallery/gallery-card.tsx` | 新增 | 画廊卡片组件 |
| `src/app/gallery/[id]/page.tsx` | 新增 | 4K 预览页面路由 |
| `src/app/gallery/[id]/preview-client.tsx` | 新增 | 4K 预览客户端逻辑 |
| `src/components/desktop-nav.tsx` | 修改 | 添加画廊图标入口 |
| `src/components/diary/diary-content.tsx` | 修改 | 导出按钮改为保存到画廊 |
| `src/components/weekly/weekly-report.tsx` | 修改 | 导出按钮改为保存到画廊 |
| `src/app/settings/page.tsx` | 修改 | 备份恢复加入画廊数据 |

## 非目标（不在此版本实现）

- 图片拖拽排序
- 图片编辑/标注
- 社交媒体分享 SDK 对接
- 画廊数据的云端同步
