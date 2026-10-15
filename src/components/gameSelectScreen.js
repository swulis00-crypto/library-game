/**
 * 화면 컴포넌트: 게임 선택 화면
 *  - 카드마다 실제 게임 화면 미리보기(첫 문제의 게임판을 캔버스에 그림)
 *  - 이번 시간에 모은 별(세션 전용) 표시
 *  - 쉬움 / 도전 난이도 선택
 */

import { store, GAME_METADATA } from '../state/store.js';
import { soundFx } from '../audio/soundFx.js';

import { MazeGame } from '../games/mazeGame.js';
import { ShelfSortGame } from '../games/shelfSortGame.js';
import { SpaceDefenseGame } from '../games/spaceDefenseGame.js';
import { BrickBreakerGame } from '../games/brickBreakerGame.js';
import { SnakeGame } from '../games/snakeGame.js';
import { WhackMoleGame } from '../games/whackMoleGame.js';

const PREVIEW_CLASSES = {
  maze: MazeGame,
  shelfSort: ShelfSortGame,
  spaceDefense: SpaceDefenseGame,
  brickBreaker: BrickBreakerGame,
  snake: SnakeGame,
  whackMole: WhackMoleGame
};

function starRow(n) {
  return [1, 2, 3].map(i => `<span class="star ${i <= n ? 'on' : ''}">★</span>`).join('');
}

/** 카드 안 캔버스에 게임 화면 한 장 그리기 */
function paintPreview(canvas, gameId, difficulty) {
  const GameClass = PREVIEW_CLASSES[gameId];
  if (!GameClass) return;
  try {
    const game = new GameClass(canvas, {
      questions: store.getRound(gameId, difficulty),
      difficulty,
      avatar: store.session.avatar
    });
    game.preview();
    game.destroy();
  } catch (e) {
    console.warn('preview failed', gameId, e);
  }
}

export function renderGameSelectScreen(container) {
  const diff = store.difficulty;
  const games = Object.values(GAME_METADATA);
  const s = store.session;

  container.innerHTML = `
    <div class="game-select-section">
      <div class="section-header">
        <div class="section-header-title">
          <h2>🎯 어떤 게임으로 놀까요?</h2>
          <p>카드를 누르면 바로 시작! 게임마다 책 찾기 비밀이 하나씩 숨어 있어요.</p>
        </div>

        <div class="difficulty-toggle-box" role="group" aria-label="난이도">
          <button class="diff-btn ${diff === 'basic' ? 'active' : ''}" data-diff="basic">🌱 쉬움</button>
          <button class="diff-btn ${diff === 'challenge' ? 'active challenge' : ''}" data-diff="challenge">🔥 도전</button>
        </div>
      </div>

      <div class="session-bar glass-panel">
        <div class="session-avatar">${s.avatar}</div>
        <div class="session-stat"><span class="lbl">오늘 모은 별</span><span class="val">⭐ ${s.totalStars} / ${games.length * 3}</span></div>
        <div class="session-stat"><span class="lbl">플레이</span><span class="val">${s.plays}번</span></div>
        <div class="session-stat"><span class="lbl">최고 콤보</span><span class="val">🔥 x${s.bestCombo}</span></div>
        <div class="session-note">새로고침하면 별은 사라져요. 기록은 남기지 않아요!</div>
      </div>

      <div class="games-grid">
        ${games.map(g => {
          const stars = s.stars[g.id] || 0;
          return `
            <div class="glass-panel game-card has-preview" data-game-id="${g.id}" style="--card-color: ${g.themeColor};">
              <div class="game-card-stars" title="이번 시간 최고 별">${starRow(stars)}</div>
              <div class="game-card-head">
                <div class="game-card-icon">${g.icon}</div>
                <div class="game-card-head-text">
                  <h3 class="game-card-title">${g.title}</h3>
                  <p class="game-card-sub">${g.subtitle}</p>
                </div>
              </div>

              <div class="game-card-preview-wrap">
                <canvas class="game-card-preview" data-game-id="${g.id}" width="800" height="${g.id === 'snake' ? 512 : 520}" aria-label="${g.title} 게임 화면 미리보기"></canvas>
                <div class="game-card-preview-play">▶</div>
              </div>

              <div class="game-card-skills"><span>💡</span> ${g.skills}</div>
              <div class="game-card-footer">
                <span class="game-card-howto">${g.howTo.split('.')[0]}.</span>
                <button class="game-play-btn" data-game-id="${g.id}"><span>시작</span> ▶</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // 미리보기 그리기 (화면이 먼저 뜨도록 한 프레임 뒤에)
  requestAnimationFrame(() => {
    container.querySelectorAll('.game-card-preview').forEach(canvas => {
      paintPreview(canvas, canvas.getAttribute('data-game-id'), diff);
    });
  });

  container.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      soundFx.play('click');
      store.setDifficulty(e.currentTarget.getAttribute('data-diff'));
    });
  });

  container.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
      soundFx.play('go');
      store.setScreen('game', card.getAttribute('data-game-id'));
    });
  });
}
