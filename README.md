# React + TypeScript + Vite

## Development

Install dependencies with `npm install`, then run `npm run dev`.

- `npm run typecheck` checks the React application and Vite configuration.
- `npm run lint` runs ESLint for JavaScript and TypeScript files.
- `npm run build` checks types and creates a production build in `dist`.
- `npm run preview` serves the production build locally.

React components use `.tsx`; other TypeScript modules use `.ts`. Strict type
checking is configured in `tsconfig.app.json` for the application and
`tsconfig.node.json` for the Vite configuration.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

ESLint includes the recommended TypeScript rules through
[`typescript-eslint`](https://typescript-eslint.io), along with React Hooks and
React Refresh rules. Type checking runs separately through `npm run typecheck`.
