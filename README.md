# monorepo-template

A monorepo template powered by [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces).

## Structure

```
monorepo-template/
├── apps/
│   └── example/          # Example application
├── packages/
│   └── utils/            # Shared utility library
├── package.json          # Root workspace configuration
├── tsconfig.json         # Shared TypeScript configuration
├── .eslintrc.json        # Shared ESLint configuration
└── .prettierrc           # Shared Prettier configuration
```

## Getting started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install dependencies

```bash
npm install
```

npm workspaces automatically links all packages in `packages/` and `apps/` together so local packages can be imported as regular dependencies.

## Scripts

All scripts can be run from the root of the repository:

| Script                 | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run build`        | Build all workspaces                 |
| `npm run test`         | Run tests across all workspaces      |
| `npm run lint`         | Lint all TypeScript/JavaScript files |
| `npm run lint:fix`     | Auto-fix lint errors                 |
| `npm run format`       | Format all files with Prettier       |
| `npm run format:check` | Check formatting without writing     |

To run a script for a specific workspace:

```bash
npm run build --workspace=packages/utils
npm run build -w apps/example
```

## Adding a new package

1. Create a new directory under `packages/` (for libraries) or `apps/` (for applications).
2. Add a `package.json` with a scoped name, e.g. `@monorepo-template/my-package`.
3. Add a `tsconfig.json` that extends the root configuration.
4. Run `npm install` from the root to link the new workspace.

To depend on another workspace package, add it to the `dependencies` field with `"*"` as the version:

```json
{
  "dependencies": {
    "@monorepo-template/utils": "*"
  }
}
```

## License

[MIT](LICENSE)
