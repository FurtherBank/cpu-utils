# 研发操作成功执行标准

本文档定义了在本 monorepo 中进行各类研发操作时，**判断操作成功执行**的具体标准。满足以下所有标准，表示对应操作已正确完成，且不会引入 monorepo 基建层面的问题。

---

## 目录

1. [新增 Package（共享库）](#1-新增-package共享库)
2. [新增 App（应用）](#2-新增-app应用)
3. [在 Package/App 中引用其他 Package](#3-在-packageapp-中引用其他-package)
4. [安装与管理依赖](#4-安装与管理依赖)
5. [构建](#5-构建)
6. [测试](#6-测试)
7. [代码风格：Lint 与格式化](#7-代码风格lint-与格式化)
8. [删除 Package 或 App](#8-删除-package-或-app)

---

## 1. 新增 Package（共享库）

操作成功的判断标准：

- [ ] `packages/<name>/package.json` 存在，且 `name` 字段为 `@monorepo-template/<name>` 格式。
- [ ] `packages/<name>/tsconfig.json` 存在，且通过 `"extends": "../../tsconfig.json"` 继承根配置。
- [ ] `packages/<name>/src/index.ts` 存在，作为包的入口文件。
- [ ] 在根目录执行 `npm install` 后，`node_modules/@monorepo-template/<name>` 软链接存在并指向 `packages/<name>`。
- [ ] 在 `packages/<name>` 目录下执行 `npm run build` 后，`dist/` 目录生成，其中包含 `index.js` 和 `index.d.ts`（或对应入口文件的编译产物）。
- [ ] 在根目录执行 `npm run build` 无报错，新 package 被正确纳入构建流程。
- [ ] 在根目录执行 `npm run lint` 无报错（对新增的 `.ts` 文件生效）。
- [ ] 在根目录执行 `npm run format:check` 无报错。

---

## 2. 新增 App（应用）

操作成功的判断标准：

- [ ] `apps/<name>/package.json` 存在，且 `name` 字段为 `@monorepo-template/<name>` 格式。
- [ ] `apps/<name>/tsconfig.json` 存在，且通过 `"extends": "../../tsconfig.json"` 继承根配置。
- [ ] `apps/<name>/src/index.ts` 存在，作为应用的入口文件。
- [ ] 在根目录执行 `npm install` 后，`node_modules/@monorepo-template/<name>` 软链接存在并指向 `apps/<name>`。
- [ ] 在 `apps/<name>` 目录下执行 `npm run build` 后，`dist/` 目录生成，且无 TypeScript 编译错误。
- [ ] 在根目录执行 `npm run build` 无报错，新 app 被正确纳入构建流程。
- [ ] 在根目录执行 `npm run lint` 无报错（对新增的 `.ts` 文件生效）。
- [ ] 在根目录执行 `npm run format:check` 无报错。

---

## 3. 在 Package/App 中引用其他 Package

操作成功的判断标准：

- [ ] 引用方的 `package.json` 的 `dependencies` 中已添加 `"@monorepo-template/<dep-name>": "*"`。
- [ ] 根目录执行 `npm install` 后，引用方的 `node_modules/@monorepo-template/<dep-name>` 软链接正确建立（指向工作区本地包，而非远程包）。
- [ ] 被依赖的 package 已执行 `npm run build`，`dist/` 目录中存在编译产物和类型声明文件（`.d.ts`）。
- [ ] 引用方在 TypeScript 源码中 `import` 被依赖包时，编辑器或 `npm run typecheck` 不报类型找不到的错误。
- [ ] 引用方执行 `npm run build` 后无 TypeScript 编译错误，`dist/` 目录正常生成。
- [ ] 在根目录执行 `npm run build` 整体构建无报错。

---

## 4. 安装与管理依赖

操作成功的判断标准：

- [ ] `npm install` 命令执行完成后无报错，根目录 `package-lock.json` 已更新。
- [ ] 新依赖已出现在对应 `package.json` 的 `dependencies` 或 `devDependencies` 字段中。
- [ ] 无多余的 `node_modules` 出现在子包目录中（即依赖未被重复安装在子包层级）。
- [ ] 根目录执行 `npm run build` 无因新依赖引起的编译错误。
- [ ] 根目录执行 `npm run lint` 无因新依赖引起的报错。

---

## 5. 构建

操作成功的判断标准：

- [ ] `npm run build`（或 `npm run build -w <workspace>`）执行后，终端无错误输出，进程以退出码 `0` 结束。
- [ ] 构建目标工作区的 `dist/` 目录存在，且包含最新的 `.js`、`.d.ts`、`.js.map` 文件。
- [ ] 所有 `packages/` 下的库的 `dist/index.d.ts` 存在，供消费方正确获取类型。
- [ ] 构建产物与源码一致，不包含上次构建的过时文件（必要时先清理 `dist/` 再构建）。

---

## 6. 测试

操作成功的判断标准：

- [ ] `npm run test`（或 `npm run test -w <workspace>`）执行后，终端无报错，所有测试用例通过，进程以退出码 `0` 结束。
- [ ] 测试覆盖了新增或修改的核心逻辑（视测试策略而定）。
- [ ] 无测试用例因 monorepo 包引用问题（如找不到模块）而失败。

---

## 7. 代码风格：Lint 与格式化

操作成功的判断标准：

- [ ] 根目录执行 `npm run lint` 后，终端输出无 `error` 级别的 ESLint 报告，进程以退出码 `0` 结束。
- [ ] 根目录执行 `npm run format:check` 后，终端输出无格式不一致的文件列表，进程以退出码 `0` 结束。
- [ ] 若存在可自动修复的问题，执行 `npm run lint:fix` 和 `npm run format` 后，上述两条标准均满足。

---

## 8. 删除 Package 或 App

操作成功的判断标准：

- [ ] 对应的 `packages/<name>` 或 `apps/<name>` 目录已被删除。
- [ ] 所有依赖该包的其他 `package.json` 中，对应的 `dependencies`/`devDependencies` 条目已被移除。
- [ ] 根目录执行 `npm install` 后，`node_modules/@monorepo-template/<name>` 软链接已不存在。
- [ ] 根目录执行 `npm run build` 无报错（无悬空的模块引用）。
- [ ] 根目录执行 `npm run lint` 无报错（无对已删除包的 import 残留）。
- [ ] 根 `package-lock.json` 已更新，不再包含被删除包的记录。

---

## 综合验证清单

完成任意研发操作后，建议执行以下命令进行整体验证，全部通过则表示 monorepo 基建层面无问题：

```bash
# 1. 安装/更新依赖
npm install

# 2. 全量构建
npm run build

# 3. 全量测试
npm run test

# 4. Lint 检查
npm run lint

# 5. 格式化检查
npm run format:check
```

以上五条命令均以退出码 `0` 结束、终端无错误输出，即视为研发操作成功执行，且当前 monorepo 处于健康状态。
