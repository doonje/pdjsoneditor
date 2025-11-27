import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// 코드 스플리팅 최적화
		rollupOptions: {
			output: {
				// 무거운 라이브러리들을 별도 청크로 분리하여 초기 로딩 최적화
				manualChunks: (id) => {
					// faker.js - 가장 무거운 라이브러리, 별도 청크로 분리
					if (id.includes('@faker-js/faker')) {
						return 'faker';
					}
					// CodeMirror 관련 모듈들
					if (id.includes('codemirror') || id.includes('@codemirror') || id.includes('@lezer')) {
						return 'codemirror';
					}
					// xyflow (그래프 라이브러리)
					if (id.includes('@xyflow')) {
						return 'xyflow';
					}
					// d3 관련 모듈들 (xyflow 의존성)
					if (id.includes('d3-')) {
						return 'd3';
					}
					// dagre (그래프 레이아웃)
					if (id.includes('dagre') || id.includes('graphlib')) {
						return 'dagre';
					}
				}
			}
		},
		// 청크 크기 경고 임계값 상향 (분리된 청크들이 있으므로)
		chunkSizeWarningLimit: 600
	},
	// 개발 서버 최적화
	optimizeDeps: {
		// 무거운 의존성 사전 번들링
		include: ['@codemirror/lang-json', '@codemirror/state', 'codemirror']
	}
});
