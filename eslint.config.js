import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import reactRecommended from 'eslint-plugin-react/configs/recommended.js'
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
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // 拦截「JSX 中使用未定义/未导入组件」——GuideBlock 事故的针对性防线
      'react/jsx-no-undef': ['error', { allowGlobals: false }],
      'react/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  reactRecommended && {
    ...reactRecommended,
    files: ['**/*.{js,jsx}'],
    settings: { react: { version: 'detect' } },
    rules: {
      // 19 组件均已显式 import，无需重复校验；避免与 react-refresh 冲突的噪音规则
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-target-blank': 'off',
      'react/prop-types': 'off',
    },
  },
])
