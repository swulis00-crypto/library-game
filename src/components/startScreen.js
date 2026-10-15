/**
 * 화면 컴포넌트: 시작 화면
 *  - 글자보다 게임 화면이 먼저 보이도록: 6개 게임이 돌아가며 보이는 아케이드 쇼케이스
 *  - 내 캐릭터(아바타) 고르기 (저장하지 않음), 개인정보 입력 없음
 */

import { store, AVATARS, GAME_METADATA } from '../state/store.js';
import { soundFx } from '../audio/soundFx.js';
import { paintGamePreview } from './gamePreview.js';

const GREETINGS = [
  '안녕! 나는 책벌레 <strong>북이</strong>야. 숫자 암호를 풀고 책을 찾아보자!',
  '도서관 책에는 모두 <strong>주소</strong>가 있어. 그 주소를 읽으면 어떤 책도 금방 찾아!',
  '틀려도 괜찮아. 북이가 <strong>힌트</strong>를 알려줄게. 같이 놀자!'
];

let showcaseTimer = null;

export function renderStartScreen(container) {
  const avatar = store.session.avatar;
  const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  const games = Object.values(GAME_METADATA);

  if (showcaseTimer) { clearInterval(showcaseTimer); showcaseTimer = null; }

  container.innerHTML = `
    <div class="hero-screen v3">
      <h1 class="hero-title kid">숫자 암호를 풀고 <span class="gradient-text">책을 찾아라!</span></h1>

      <div class="hero-main">
        <!-- 아케이드 쇼케이스 -->
        <div class="arcade-frame" id="arcadeFrame">
          <div class="arcade-screen">
            <canvas id="heroShowcase" width="800" height="520" aria-label="게임 화면 미리보기"></canvas>
            <div class="arcade-caption">
              <span class="arcade-game-icon" id="arcadeIcon">${games[0].icon}</span>
              <span class="arcade-game-name" id="arcadeName">${games[0].title}</span>
            </div>
            <button class="arcade-play-this" id="btnPlayShown">이 게임 바로 하기 ▶</button>
            <button id="btnStartAdventure" class="btn-primary-large big arcade-cta"><span>▶ 게임 시작!</span></button>
            <div class="arcade-dots" id="arcadeDots">
              ${games.map((g, i) => `<i class="${i === 0 ? 'on' : ''}" data-index="${i}" style="--c:${g.themeColor}"></i>`).join('')}
            </div>
          </div>
        </div>

        <!-- 캐릭터 고르기 -->
        <div class="glass-panel hero-card-container">
          <div class="mascot-line">
            <span class="mascot-sm" aria-hidden="true">🐛</span>
            <span class="speech-bubble sm" id="mascotBubble">${greeting}</span>
          </div>
          <div class="avatar-pick-label">내 캐릭터를 골라요</div>
          <div class="avatar-grid" id="avatarGrid">
            ${AVATARS.map(a => `
              <button class="avatar-btn ${a === avatar ? 'selected' : ''}" data-avatar="${a}" aria-label="캐릭터 ${a}">${a}</button>
            `).join('')}
          </div>
          <button id="btnLearnFirst" class="btn-secondary-large learn-btn"><span>📘 먼저 배우기</span></button>
          <p class="privacy-note">🔒 이름이나 개인정보는 묻지도, 저장하지도 않아요.</p>
        </div>
      </div>

    </div>
  `;

  const showcase = container.querySelector('#heroShowcase');
  const arcadeIcon = container.querySelector('#arcadeIcon');
  const arcadeName = container.querySelector('#arcadeName');
  const dots = container.querySelectorAll('#arcadeDots i');
  let shown = 0;

  const paintShowcase = (index) => {
    shown = (index + games.length) % games.length;
    const g = games[shown];
    showcase.classList.remove('fade-in');
    void showcase.offsetWidth;
    paintGamePreview(showcase, g.id);
    showcase.classList.add('fade-in');
    arcadeIcon.textContent = g.icon;
    arcadeName.textContent = g.title;
    dots.forEach((d, i) => d.classList.toggle('on', i === shown));
  };

  requestAnimationFrame(() => {
    paintShowcase(0);
  });

  showcaseTimer = setInterval(() => {
    if (!document.body.contains(showcase)) { clearInterval(showcaseTimer); showcaseTimer = null; return; }
    paintShowcase(shown + 1);
  }, 3500);

  dots.forEach(d => d.addEventListener('click', (e) => {
    e.stopPropagation();
    paintShowcase(parseInt(e.currentTarget.getAttribute('data-index'), 10));
  }));

  container.querySelector('#btnPlayShown').addEventListener('click', (e) => {
    e.stopPropagation();
    soundFx.play('go');
    store.setScreen('game', games[shown].id);
  });

  container.querySelector('#btnStartAdventure').addEventListener('click', (e) => {
    e.stopPropagation();
    soundFx.play('go');
    store.setScreen('game-select');
  });

  container.querySelectorAll('.avatar-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      soundFx.play('coin');
      const a = e.currentTarget.getAttribute('data-avatar');
      store.setAvatar(a);
      container.querySelectorAll('.avatar-btn').forEach(b => b.classList.toggle('selected', b === e.currentTarget));
      const headerAvatar = document.getElementById('headerAvatar');
      if (headerAvatar) headerAvatar.textContent = a;
      const bubble = container.querySelector('#mascotBubble');
      if (bubble) bubble.innerHTML = `${a} 멋진 선택! <strong>게임 시작</strong>을 눌러 출발하자!`;
      // 캐릭터가 바뀌면 미리보기도 새 캐릭터로
      paintShowcase(shown);
    });
  });

  container.querySelector('#btnLearnFirst').addEventListener('click', () => {
    soundFx.play('click');
    store.setScreen('tutorial');
  });
}
