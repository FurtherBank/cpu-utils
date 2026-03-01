# Monorepo 研发帮助手册

本手册面向在本 monorepo 中进行日常研发工作的开发者，涵盖常见研发操作的标准作业流程（SOP）及注意事项。

---

## 目录

1. [仓库结构说明](#1-仓库结构说明)
2. [环境准备](#2-环境准备)
3. [新增 Package（共享库）](#3-新增-package共享库)
4. [新增 App（应用）](#4-新增-app应用)
5. [在 Package/App 中引用其他 Package](#5-在-packageapp-中引用其他-package)
6. [安装与管理依赖](#6-安装与管理依赖)
7. [构建](#7-构建)
8. [测试](#8-测试)
9. [代码风格：Lint 与格式化](#9-代码风格lint-与格式化)
10. [删除 Package 或 App](#10-删除-package-或-app)
11. [常见问题与注意事项](#11-常见问题与注意事项)

---

## 1. 仓库结构说明

```
monorepo-template/
├── apps/                   # 各业务应用
│   └── example/            # 示例应用
├── packages/               # 各共享库
│   └── utils/              # 共享工具库
├── docs/                   # 研发文档
├── package.json            # 根工作区配置（npm workspaces）
├── tsconfig.json           # 共享 TypeScript 配置
├── .eslintrc.json          # 共享 ESLint 配置
└── .prettierrc             # 共享 Prettier 配置
```

- `packages/`：存放可被多个 App 复用的共享库，发布时以 `@monorepo-template/<name>` 命名。
- `apps/`：存放各业务应用，通常不对外发布。
- 根目录的 `package.json` 通过 npm workspaces 将所有 package 和 app 统一管理。

---

## 2. 环境准备

| 依赖    | 最低版本 |
| ------- | -------- |
| Node.js | 18       |
| npm     | 9        |

```bash
# 克隆仓库后，在根目录安装所有依赖
npm install
```

> **注意**：始终在**根目录**执行 `npm install`，不要在子 package 目录下单独执行，否则会破坏 workspace 软链接。

---

## 3. 新增 Package（共享库）

### SOP

**第一步：创建目录结构**

```bash
mkdir -p packages/<name>/src
```

**第二步：创建 `package.json`**

```json
{
  "name": "@monorepo-template/<name>",
  "version": "1.0.0",
  "description": "描述该库的用途",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "test": "node --test dist/**/*.test.js",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "*"
  }
}
```

**第三步：创建 `tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

**第四步：创建入口文件**

```bash
touch packages/<name>/src/index.ts
```

**第五步：注册到工作区**

```bash
# 在根目录执行，将新 package 链接到工作区
npm install
```

### 注意事项

- `package.json` 中的 `name` 字段必须使用 `@monorepo-template/<name>` 格式，与仓库内其他包保持命名空间一致。
- `"typescript": "*"` 表示复用根工作区安装的 TypeScript 版本，避免版本冲突。
- `tsconfig.json` 必须通过 `"extends"` 继承根配置，以确保编译选项全局统一。
- `"files": ["dist"]` 确保只发布编译产物，不包含源码。

---

## 4. 新增 App（应用）

### SOP

**第一步：创建目录结构**

```bash
mkdir -p apps/<name>/src
```

**第二步：创建 `package.json`**

```json
{
  "name": "@monorepo-template/<name>",
  "version": "1.0.0",
  "description": "描述该应用的用途",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "start": "node dist/index.js",
    "dev": "node --watch dist/index.js",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "*"
  }
}
```

**第三步：创建 `tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

**第四步：创建入口文件**

```bash
touch apps/<name>/src/index.ts
```

**第五步：注册到工作区**

```bash
npm install
```

### 注意事项

- App 通常不需要 `"files"` 字段，因为它不对外发布。
- App 不应被其他 package 或 app 依赖；如果有共用逻辑，应抽离为 package。

---

## 5. 在 Package/App 中引用其他 Package

### SOP

在需要使用共享库的 `package.json` 中，将其添加到 `dependencies`：

```json
{
  "dependencies": {
    "@monorepo-template/utils": "*"
  }
}
```

版本使用 `"*"` 表示始终引用工作区本地版本，由 npm workspaces 自动建立软链接。

然后重新安装依赖：

```bash
npm install
```

### 注意事项

- 本地 workspace 依赖**只能**使用 `"*"` 作为版本号，不可使用具体版本号（如 `"^1.0.0"`），否则 npm 会尝试从远程注册表拉取包。
- 引用前确保被依赖的 package 已经执行过 `npm run build`，否则 `dist/` 目录不存在，导入会失败。
- TypeScript 项目中使用本地包时，需确保被依赖包的 `types` 字段已正确指向编译产物中的 `.d.ts` 文件。

---

## 6. 安装与管理依赖

### 为根工作区添加依赖（所有包共用的开发工具）

```bash
npm install <package> --save-dev
```

### 为特定 package 或 app 添加依赖

```bash
npm install <package> --workspace=packages/<name>
npm install <package> -w apps/<name>
```

### 为特定 package 或 app 添加开发依赖

```bash
npm install <package> --save-dev --workspace=packages/<name>
```

### 注意事项

- **始终从根目录操作**，切勿在子目录下直接执行 `npm install <package>`。
- 共享的开发工具（如 `typescript`、`eslint`、`prettier`）安装在根目录；业务逻辑依赖安装在对应的 package 或 app 下。
- 子 package 中的 `"typescript": "*"` 会自动复用根工作区的 TypeScript，无需为每个子包单独指定版本。

---

## 7. 构建

### 构建所有工作区

```bash
npm run build
```

### 构建特定工作区

```bash
npm run build --workspace=packages/utils
npm run build -w apps/example
```

### 注意事项

- 构建会调用各子包的 `tsc`，输出到各自的 `dist/` 目录。
- 如果 app 依赖某个 package，需先构建该 package，再构建 app。根目录的 `npm run build` 会按工作区顺序执行，通常无需手动排序。
- `dist/` 目录已在 `.gitignore` 中忽略，不应提交到版本控制。

---

## 8. 测试

### 运行所有测试

```bash
npm run test
```

### 运行特定工作区的测试

```bash
npm run test --workspace=packages/utils
npm run test -w apps/example
```

### 注意事项

- 测试使用 Node.js 内置测试框架（`node --test`），测试文件命名规范为 `*.test.ts`（编译后为 `*.test.js`）。
- 运行测试前必须先执行 `npm run build`（或对应工作区的构建），因为测试命令运行的是编译后的 JS 文件。
- 根 `tsconfig.json` 中 `"exclude"` 已排除 `**/*.test.ts`，测试文件不会被打包进 `dist/`；测试文件的编译需在子包的 `tsconfig.json` 中单独配置（或使用独立的 `tsconfig.test.json`）。

---

## 9. 代码风格：Lint 与格式化

### 检查所有文件

```bash
npm run lint
npm run format:check
```

### 自动修复

```bash
npm run lint:fix
npm run format
```

### 注意事项

- ESLint 配置位于根目录 `.eslintrc.json`，子包无需单独配置，除非有特殊覆盖需求。
- Prettier 配置位于根目录 `.prettierrc`，格式化规则全局统一。
- 提交代码前建议先执行 `npm run lint` 和 `npm run format:check`，确保无风格错误。

---

## 10. 删除 Package 或 App

### SOP

1. 删除对应目录：

   ```bash
   rm -rf packages/<name>
   # 或
   rm -rf apps/<name>
   ```

2. 在所有依赖该包的 `package.json` 中，移除对应的 `dependencies` 或 `devDependencies` 条目。

3. 在根目录重新安装，清理软链接：

   ```bash
   npm install
   ```

### 注意事项

- 删除前检查是否有其他 package 或 app 依赖该包，避免遗漏依赖清理导致构建或运行时错误。
- `node_modules/.package-lock.json` 和根 `package-lock.json` 会由 `npm install` 自动更新，无需手动修改。

---

## 11. 常见问题与注意事项

### Q：执行 `npm install` 后本地包无法被正确引用？

确认以下几点：

1. 被依赖包的 `package.json` 中 `name` 字段与引用方 `dependencies` 中的名称完全一致。
2. 版本号使用 `"*"`。
3. 被依赖包已完成 `npm run build`，`dist/` 目录存在。

### Q：TypeScript 报找不到模块或类型？

1. 确认被依赖包的 `tsconfig.json` 中 `outDir` 和 `rootDir` 配置正确。
2. 确认 `package.json` 中 `main` 和 `types` 指向正确的编译产物路径。
3. 重新执行 `npm run build` 确保 `.d.ts` 文件已生成。

### Q：根目录执行 `npm run build` 时某些包构建失败？

检查失败包的 `tsconfig.json` 是否正确继承根配置，并确认 `include`/`exclude` 路径无误。

### Q：新增的 package 没有出现在 `node_modules/@monorepo-template/` 下？

在根目录重新执行 `npm install`，npm workspaces 会重新建立软链接。

### Q：如何只对单个工作区执行命令？

```bash
npm run <script> -w <workspace-name-or-path>
# 示例
npm run build -w @monorepo-template/utils
npm run build -w packages/utils
```
