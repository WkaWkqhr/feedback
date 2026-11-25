const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = window.APP_CONFIG || {};
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const RATINGS = ['satisfied', 'neutral', 'dissatisfied'];

const $ = (id) => document.getElementById(id);
const views = { student: $('studentView'), login: $('loginView'), admin: $('adminView') };

function show(name) {
  Object.entries(views).forEach(([key, el]) => el.classList.toggle('hidden', key !== name));
  $('loginOpen').classList.toggle('hidden', name !== 'student');
  $('logoutBtn').classList.toggle('hidden', name !== 'admin');
}

// 학생 투표
document.querySelectorAll('.vote').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const buttons = document.querySelectorAll('.vote');
    buttons.forEach((b) => (b.disabled = true));
    const msg = $('voteMsg');
    msg.classList.remove('error');
    msg.textContent = '';
    const { error } = await db.from('votes').insert({ rating: btn.dataset.rating });
    if (error) {
      msg.classList.add('error');
      msg.textContent = '투표 저장에 실패했습니다. 다시 시도해 주세요.';
    } else {
      msg.textContent = '투표가 완료되었습니다. 감사합니다.';
    }
    buttons.forEach((b) => (b.disabled = false));
  });
});

// 관리자 로그인
$('loginOpen').addEventListener('click', () => show('login'));
$('loginCancel').addEventListener('click', () => show('student'));

$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('loginMsg').textContent = '';
  const { error } = await db.auth.signInWithPassword({
    email: $('email').value.trim(),
    password: $('password').value,
  });
  if (error) {
    $('loginMsg').textContent = '로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.';
    return;
  }
  $('loginForm').reset();
  show('admin');
  loadResults();
});

$('logoutBtn').addEventListener('click', async () => {
  await db.auth.signOut();
  $('voteMsg').textContent = '';
  show('student');
});

// 관리자 결과
async function loadResults() {
  $('adminMsg').classList.remove('error');
  $('adminMsg').textContent = '';
  const results = await Promise.all(
    RATINGS.map((r) => db.from('votes').select('*', { count: 'exact', head: true }).eq('rating', r))
  );
  const failed = results.find((r) => r.error);
  if (failed) {
    $('adminMsg').classList.add('error');
    $('adminMsg').textContent = '결과를 불러오지 못했습니다.';
    return;
  }
  render(Object.fromEntries(RATINGS.map((r, i) => [r, results[i].count || 0])));
}

function render(counts) {
  const total = RATINGS.reduce((sum, r) => sum + counts[r], 0);
  $('total').textContent = total;
  RATINGS.forEach((r) => {
    const pct = total ? Math.round((counts[r] / total) * 1000) / 10 : 0;
    const row = document.querySelector(`.row[data-rating="${r}"]`);
    row.querySelector('.stat').textContent = `${counts[r]}표 (${pct}%)`;
    row.querySelector('.fill').style.width = `${pct}%`;
  });
}

$('refreshBtn').addEventListener('click', loadResults);

$('resetBtn').addEventListener('click', async () => {
  if (!confirm('모든 투표 결과를 초기화하시겠습니까? 삭제된 결과는 복구할 수 없습니다.')) return;
  const { error } = await db.from('votes').delete().gt('id', 0);
  if (error) {
    $('adminMsg').classList.add('error');
    $('adminMsg').textContent = '초기화에 실패했습니다.';
    return;
  }
  render({ satisfied: 0, neutral: 0, dissatisfied: 0 });
  $('adminMsg').textContent = '투표 결과가 초기화되었습니다.';
});

// 기존 세션 확인
db.auth.getSession().then(({ data }) => {
  if (data.session) {
    show('admin');
    loadResults();
  }
});
