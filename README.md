# sudoku-vue

一个基于 `Taro + Vue 3 + TypeScript + Pinia` 的微信小程序数独项目。

## 技术栈

- Taro 4
- Vue 3
- TypeScript
- Pinia
- Vitest

## 当前功能

- 9 x 9 数独棋盘
- 题面生成与校验
- 难度切换
- 单格填写、清空、提示
- 提交校验、重置、重开
- 微信小程序原生 Toast / Modal 反馈

## 推荐环境

- Node.js 22
- npm 10+

## 安装依赖

```bash
npm install --legacy-peer-deps
```

当前依赖树需要使用 `--legacy-peer-deps`，否则会被 Taro 与部分上游 peer 依赖约束卡住。

## 本地开发

```bash
npm run dev
```

## 生产构建

```bash
npm run build
```

## 类型检查

```bash
npm run typecheck
```

## 运行测试

```bash
npm run test
```

## 微信开发者工具接入

1. 先执行 `npm run build` 或 `npm run dev`
2. 使用微信开发者工具导入当前仓库根目录
3. 确认 [project.config.json](/Users/gaosikang/Desktop/work/typescript/sudoku-vue/project.config.json) 中的 `appid` 已替换为你的真实小程序 AppID
4. 如果只想保留本地私有配置，可参考 [project.private.config.json.example](/Users/gaosikang/Desktop/work/typescript/sudoku-vue/project.private.config.json.example)

说明：

- 小程序构建输出目录为 `dist/`
- `project.config.json` 已将 `miniprogramRoot` 指向 `dist/`

## 项目结构

```text
src/
├── pages/         # 小程序页面
├── services/      # 小程序反馈封装
├── stores/        # Pinia 状态管理
├── test/          # 核心逻辑测试
├── types/         # 类型定义
└── utils/         # 数独生成、校验、求解等核心逻辑
```
