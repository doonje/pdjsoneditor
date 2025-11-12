import type { Translation } from '../i18n-types';

const ko: Translation = {
	navigation: {
		jsonEditor: 'JSON 에디터',
		encodeDecode: '인코딩/디코딩',
		hash: '해시 생성',
		timestamp: '타임스탬프 변환'
	},
	header: {
		title: 'JSON 에디터',
		clear: '지우기',
		copy: '복사',
		copySuccess: '클립보드에 복사됨',
		copyError: '클립보드 복사 실패',
		format: '정렬',
		minify: '축소',
		sample: '샘플 데이터',
		language: '언어'
	},
	editor: {
		placeholder: 'JSON 데이터를 입력하세요...',
		invalidJson: '잘못된 JSON',
		validJson: '유효한 JSON',
		urlPlaceholder: 'JSON을 가져올 URL 입력...',
		urlRequired: 'URL이 필요합니다',
		fetchError: '데이터를 가져오는데 실패했습니다',
		go: '가져오기',
		requestSettings: '요청 설정',
		requestSettingsDescription: 'HTTP 헤더와 요청 본문을 설정합니다',
		headers: '헤더',
		headerKey: '헤더 키',
		headerValue: '헤더 값',
		addHeader: '헤더 추가',
		body: '본문',
		bodyDescription: 'POST/PUT/PATCH 요청에 사용할 본문을 설정합니다.',
		bodyPlaceholder: '요청 본문 입력 (JSON, XML 등)',
		useEditorContent: '에디터 내용을 요청 본문으로 사용',
		sendAsRawText: '원시 텍스트로 전송 (JSON 파싱하지 않음)',
		clearAll: '모두 지우기',
		clearAllConfirm: '모든 설정을 지우시겠습니까? 저장된 헤더, 본문, URL이 모두 삭제됩니다.',
		cancel: '취소',
		save: '저장',
		regenerate: '재생성',
		regenerateTooltip: 'JSON 구조를 유지하면서 값만 재생성',
		regenerateSuccess: 'JSON 값이 성공적으로 재생성되었습니다'
	},
	graph: {
		showMore: '{count} 개 더 보기',
		showLess: '간략하게 보기',
		expand: '펼치기',
		collapse: '접기',
		expandAll: '모두 펼치기'
	},
	languages: {
		en: 'English',
		ko: '한국어',
		ja: '日本語'
	},
	footer: {
		ready: '준비됨'
	},
	tabs: {
		rename: '이름 변경',
		duplicate: '복제',
		exportJson: 'JSON 내보내기',
		closeTab: '탭 닫기',
		importJsonFile: 'JSON 파일 가져오기',
		newTab: '새 탭',
		import: '가져오기'
	},
	encodeDecode: {
		title: '인코딩/디코딩',
		description: '다양한 인코딩 방식으로 텍스트를 인코딩하거나 디코딩합니다',
		input: '입력',
		output: '출력',
		inputPlaceholder: '인코딩 또는 디코딩할 텍스트를 입력하세요...',
		base64: 'Base64',
		base64Encode: 'Base64 인코딩',
		base64Decode: 'Base64 디코딩',
		url: 'URL',
		urlEncode: 'URL 인코딩',
		urlDecode: 'URL 디코딩',
		encode: '인코딩',
		decode: '디코딩',
		clear: '지우기',
		copy: '복사',
		copySuccess: '클립보드에 복사됨',
		decodeError: '디코딩에 실패했습니다. 입력을 확인해주세요.',
		encodeError: '인코딩에 실패했습니다. 입력을 확인해주세요.'
	},
	hash: {
		title: '해시 생성',
		description: '다양한 알고리즘을 사용하여 해시 값을 생성합니다',
		input: '입력',
		inputPlaceholder: '해시를 생성할 텍스트를 입력하세요...',
		md5: 'MD5',
		sha1: 'SHA-1',
		sha256: 'SHA-256',
		sha512: 'SHA-512',
		generate: '생성',
		clear: '지우기',
		copy: '복사',
		copySuccess: '클립보드에 복사됨',
		result: '결과',
		algorithm: '알고리즘'
	},
	timestamp: {
		title: '타임스탬프 변환',
		description: '타임스탬프와 날짜 간의 변환',
		timestampToDate: '타임스탬프 → 날짜',
		dateToTimestamp: '날짜 → 타임스탬프',
		timestamp: '타임스탬프',
		timestampPlaceholder: '타임스탬프 입력 (예: 1234567890)',
		date: '날짜',
		currentTimestamp: '현재 타임스탬프',
		convert: '변환',
		clear: '지우기',
		copy: '복사',
		copySuccess: '클립보드에 복사됨',
		invalidTimestamp: '잘못된 타임스탬프',
		invalidDate: '잘못된 날짜',
		milliseconds: '밀리초',
		seconds: '초',
		unit: '단위'
	}
} satisfies Translation;

export default ko;
