import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import _import from 'eslint-plugin-import';
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: [
            '**/*.config.*',
            '**/*rc.cjs',
            '**/node_modules/',
            '**/coverage/',
            '**/.turbo/',
            '**/build/',
            '**/dist/',
            '**/public/',
            '**/.env',
            '**/.env.*',
            '!**/.env.sample',
        ],
    },
    ...fixupConfigRules(
        compat.extends(
            'eslint:recommended',
            'plugin:import/recommended',
            'plugin:import/typescript',
            'plugin:@typescript-eslint/recommended',
            'prettier'
        )
    ),
    {
        plugins: {
            import: fixupPluginRules(_import),
            '@typescript-eslint': fixupPluginRules(typescriptEslintEslintPlugin),
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },

            parser: tsParser,
            ecmaVersion: 5,
            sourceType: 'module',

            parserOptions: {
                project: ['tsconfig.json'],
            },
        },

        settings: {
            'import/resolver': {
                typescript: {
                    project: ['tsconfig.json', 'apps/*/tsconfig.json'],
                },
            },
        },

        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],

            'import/order': [
                'error',
                {
                    alphabetize: {
                        order: 'asc',
                    },

                    'newlines-between': 'always',
                },
            ],
        },
    },
];
