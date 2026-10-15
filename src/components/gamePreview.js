/**
 * 게임 화면 미리보기 그리기 (시작 화면 쇼케이스, 게임 선택 카드 공용)
 * 각 게임 클래스의 실제 그리기 코드로 첫 문제의 게임판을 한 장 그린다.
 */

import { store } from '../state/store.js';
import { MazeGame } from '../games/mazeGame.js';
import { ShelfSortGame } from '../games/shelfSortGame.js';
import { SpaceDefenseGame } from '../games/spaceDefenseGame.js';
import { BrickBreakerGame } from '../games/brickBreakerGame.js';
import { SnakeGame } from '../games/snakeGame.js';
import { WhackMoleGame } from '../games/whackMoleGame.js';

export const PREVIEW_CLASSES = {
  maze: MazeGame,
  shelfSort: ShelfSortGame,
  spaceDefense: SpaceDefenseGame,
  brickBreaker: BrickBreakerGame,
  snake: SnakeGame,
  whackMole: WhackMoleGame
};

export function paintGamePreview(canvas, gameId, difficulty = store.difficulty) {
  const GameClass = PREVIEW_CLASSES[gameId];
  if (!GameClass || !canvas) return false;
  try {
    const game = new GameClass(canvas, {
      questions: store.getRound(gameId, difficulty),
      difficulty,
      avatar: store.session.avatar
    });
    game.preview();
    game.destroy();
    return true;
  } catch (e) {
    console.warn('preview failed', gameId, e);
    return false;
  }
}
