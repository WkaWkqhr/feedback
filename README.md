# CLASS FEEDBACK

수업 만족도 조사 웹앱 (HTML · CSS · JavaScript + Supabase JS SDK)

## 구성

| 파일 | 설명 |
| --- | --- |
| `index.html` / `style.css` / `app.js` | 단일 페이지 앱 (학생 투표 · 관리자 로그인 · 결과) |
| `build.js` | Vercel 빌드 시 환경변수로 `dist/config.js` 생성 |
| `schema.sql` | Supabase `votes` 테이블 · RLS 정책 |

## Vercel 환경변수

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` (공개용 Publishable Key, Secret/Service Role Key 사용 금지)

## 관리자 계정

Supabase Dashboard → **Authentication → Users → Add user → Create new user** 에서 생성합니다.
코드·저장소·환경변수에는 관리자 계정 정보를 저장하지 않습니다.
