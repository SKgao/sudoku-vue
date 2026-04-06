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
2. 使用微信开发者工具导入 `dist/` 目录
3. 项目类型选择“小程序”，不要选“小游戏”
4. 当前 AppID 已配置在 [project.config.json](/Users/gaosikang/Desktop/work/typescript/sudoku-vue/project.config.json) 中：
   `wx20a94f8352cd9757`
5. 如果只想保留本地私有配置，可参考 [project.private.config.json.example](/Users/gaosikang/Desktop/work/typescript/sudoku-vue/project.private.config.json.example)

说明：

- 小程序构建输出目录为 `dist/`
- 构建产物目录中会生成可直接导入微信开发者工具的 [dist/project.config.json](/Users/gaosikang/Desktop/work/typescript/sudoku-vue/dist/project.config.json)
- 如果导入根目录，开发者工具有时会错误解析 `miniprogramRoot`，导致找不到 `app.json`
- 如果误按“小游戏”打开，会报 `game.js 未找到`，这是项目类型选错，不是构建缺文件

## 已知注意事项

- 微信小程序 `showModal` 的 `confirmText` 和 `cancelText` 最多支持 4 个中文字符；项目里已经做了统一截断兜底。
- 微信开发者工具内置的 TypeScript 检查和 Taro 实际构建链不完全一致；如果看到编辑器级别的旧 TS 警告，优先以 `npm run typecheck` 和 `npm run build` 结果为准。
- 当前页面布局已针对微信小程序做了兼容处理，棋盘单元格尺寸通过运行时测量同步，避免出现 9 宫格错位。

## 项目结构

```text
src/
├── pages/         # 小程序页面
├── services/      # 小程序反馈封装
├── stores/        # Pinia 状态管理
├── app.ts         # 小程序入口
├── app.config.ts  # 小程序全局配置
├── test/          # 核心逻辑测试
├── types/         # 类型定义
└── utils/         # 数独生成、校验、求解等核心逻辑
```
