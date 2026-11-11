# TeleCraft

基于 React + Vite 的前端项目。

## 技术栈

- **React 19** + **TypeScript**（strict）
- **Vite** 构建
- **react-router** v8 路由
- **@tanstack/react-query** 服务端状态
- **Zustand** 客户端全局状态
- **axios** 请求层
- **Tailwind CSS** v4 样式
- **Vitest** + **Testing Library** 测试
- **ESLint** + **Prettier** 代码质量
- **husky** + **lint-staged** 提交前校验

## 环境要求

- Node `>= 20.19.0`（见 `.nvmrc`，建议用 nvm：`nvm use`）
- 包管理器 **pnpm**（`>= 9`）

## 快速开始

```bash
pnpm install          # 安装依赖
cp .env.example .env.local   # 准备环境变量
pnpm dev              # 启动开发服务器
```

## 常用命令

| 命令                 | 说明                    |
| -------------------- | ----------------------- |
| `pnpm dev`           | 启动开发服务器          |
| `pnpm build`         | 类型检查 + 生产构建     |
| `pnpm preview`       | 预览构建产物            |
| `pnpm lint`          | ESLint 检查             |
| `pnpm format`        | Prettier 格式化全部文件 |
| `pnpm test`          | 运行测试（watch）       |
| `pnpm test:run`      | 运行一次测试            |
| `pnpm test:coverage` | 测试覆盖率报告          |

## 目录结构

```
src/
  api/        接口层：request 封装 + 各业务模块接口
  components/ 全局通用组件（纯 UI）
  hooks/      全局通用 hooks（含 react-query）
  layouts/    布局组件
  router/     路由表
  store/      Zustand 客户端全局状态
  types/      全局共享类型
  utils/      纯函数工具
  views/      路由页面（一个路由一个目录，入口 index.tsx）
  test/       测试 setup
```

数据流向单向：`views → hooks → api / store / utils / types`。

## 环境变量

- 只有 `VITE_` 前缀的变量会暴露到前端，通过 `import.meta.env.VITE_XXX` 读取。
- `.env.example` 为模板（提交）；真实值写在 `.env.local`（不提交）。
- 新增变量需同步更新 `src/vite-env.d.ts` 的类型。

## 约定

项目架构与编码规范固化在 `.cursor/rules/` 下，供人与 AI 共同遵守。
