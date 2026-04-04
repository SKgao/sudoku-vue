# sudoku-vue

一个基于 Vue 3 的数独小游戏项目，当前已经完成从 Vue 2 + Vue CLI 迁移到 Vue 3 + Vite + TypeScript。

## 技术栈

- Vue 3
- Vite
- TypeScript
- Pinia
- Vue Router 4
- UnoCSS
- Reka UI

## 当前功能

- 9 x 9 数独棋盘
- 题面生成与校验
- 单元格数字弹出面板
- 提交、检查、重置、清理、重建
- 作弊填充与红色答案标记
- Toast / Alert Dialog / Confirm Dialog 提示体系

## 推荐环境

- Node.js 22
- npm 10+

## 安装依赖

```bash
npm install
```

## 本地开发

```bash
npm run dev
```

兼容旧命令：

```bash
npm run serve
```

默认会使用 Vite 本地开发服务器启动项目。

## 类型检查

```bash
npm run typecheck
```

## 生产构建

```bash
npm run build
```

## 本地预览构建结果

```bash
npm run preview
```

## 项目结构

```text
src/
├── components/    # 通用 UI 组件
├── composables/   # 全局弹窗、提示等状态封装
├── stores/        # Pinia 状态管理
├── types/         # TypeScript 类型定义
├── utils/         # 数独生成、校验、工具方法
└── views/         # 页面视图
```

## 说明

- 当前项目使用 UnoCSS 原子化样式，不再使用旧版 Less 全局样式方案。
- 提示弹窗能力基于 `reka-ui` 封装，采用接近 shadcn 风格的 Vue 实现。
- `src/components/HelloWorld.vue` 当前未参与实际页面使用。
