export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'type-enum': [
			2,
			'always',
			[
				'feat', // 새로운 기능
				'fix', // 버그 수정
				'refactor', // 리팩토링
				'perf', // 성능 개선
				'docs', // 문서 변경
				'style', // 코드 스타일 변경 (포맷팅 등)
				'test', // 테스트 추가/수정
				'build', // 빌드 시스템 변경
				'ci', // CI/CD 설정 변경
				'chore', // 기타 변경사항
				'revert' // 커밋 되돌리기
			]
		],
		'subject-case': [2, 'never', ['upper-case']], // 제목 첫글자 대문자 금지
		'subject-empty': [2, 'never'], // 제목 필수
		'subject-full-stop': [2, 'never', '.'], // 제목 끝에 마침표 금지
		'header-max-length': [2, 'always', 100] // 헤더 최대 길이 100자
	}
};
