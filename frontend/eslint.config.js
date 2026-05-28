import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // these were producing hundreds of noisy errors that don't catch real bugs in this project.
      // keep `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps` enabled (they catch real issues).
      'no-unused-vars': 'off',
      'no-irregular-whitespace': 'off',
      'no-useless-assignment': 'off',
      // new in eslint-plugin-react-hooks v7 - very aggressive about flagging normal
      // data-fetching patterns (`setLoading(true); fetch(...)` inside useEffect).
      'react-hooks/set-state-in-effect': 'off',
      // fast-refresh constraint that fires for context files exporting both a Provider and a hook.
      // not relevant to production behavior.
      'react-refresh/only-export-components': 'off',
    },
  },
])
