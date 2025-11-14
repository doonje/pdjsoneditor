import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.{js,ts,svelte}'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module',
				extraFileExtensions: ['.svelte']
			}
		},
		plugins: {
			'@typescript-eslint': typescript
		},
		rules: {
			// TypeScript 타입 안전성 규칙
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'error', // any 타입 완전 금지
			'@typescript-eslint/explicit-function-return-type': 'off', // 타입 추론 활용
			'@typescript-eslint/no-non-null-assertion': 'warn',
			// 타입 정보가 필요한 규칙들은 비활성화 (parserOptions.project 설정 필요)
			// '@typescript-eslint/no-unsafe-assignment': 'warn',
			// '@typescript-eslint/no-unsafe-member-access': 'warn',
			// '@typescript-eslint/no-unsafe-call': 'warn',
			// '@typescript-eslint/no-unsafe-return': 'warn',
			'@typescript-eslint/consistent-type-imports': ['error', {
				prefer: 'type-imports',
				disallowTypeAnnotations: true
			}],

			// 일반 코드 품질 규칙
			'prefer-const': 'error',
			'no-var': 'error',
			'no-console': 'off', // 개발 중 console 허용
			'no-debugger': 'error',
			'no-alert': 'error',
			'no-duplicate-imports': 'error',

			// 명명 규칙 (인터페이스 I 접두사만 강제)
			'@typescript-eslint/naming-convention': [
				'error',
				{
					selector: 'interface',
					format: ['PascalCase'],
					prefix: ['I']
				}
			],

			// 복잡도 관련 규칙 (적정 수준으로 완화)
			'complexity': ['warn', { max: 15 }],
			'max-depth': ['warn', { max: 5 }],
			'max-lines': ['warn', { max: 500, skipComments: true }],

			// 끄거나 완화된 규칙들
			'no-undef': 'off',
			'no-unused-vars': 'off'
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: typescriptParser
			}
		},
		rules: {
			'svelte/no-at-html-tags': 'off',
			'svelte/valid-compile': ['error', { ignoreWarnings: true }],
			'svelte/require-each-key': 'off',
			'svelte/no-dupe-else-if-blocks': 'off',
			'svelte/prefer-svelte-reactivity': 'off'
		}
	},
	{
		ignores: [
			// Build output
			'.svelte-kit/**',
			'build/**',
			'dist/**',
			'node_modules/**',
			// Test reports
			'playwright-report/**',
			'test-results/**',
			'coverage/**',
			// Config and generated files
			'*.config.js',
			'*.config.ts',
			'.DS_Store',
			'*.min.js',
			// Temporary files
			'*.tmp',
			'*.log',
			'.env',
			'.env.*',
			'!.env.example',
			'vite.config.js.timestamp-*',
			'vite.config.ts.timestamp-*',
			// IDE
			'.vscode/**',
			'.idea/**',
			// Documentation
			'CLAUDE.md',
			'*.md',
			// Generated i18n files
			'src/i18n/i18n-*.ts'
		]
	}
];
