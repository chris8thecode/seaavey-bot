import { checkAsahOtak } from "../commands/game/asahotak";
import { checkCakLontong } from "../commands/game/caklontong";
import { checkFamily100 } from "../commands/game/family100";
import { checkMathAnswer } from "../commands/game/math";
import { checkSiapakahAku } from "../commands/game/siapakahaku";
import { checkSusunKata } from "../commands/game/susunkata";
import { checkTebakAnime } from "../commands/game/tebakanime";
import { checkTebakBendera } from "../commands/game/tebakbendera";
import { checkTebakGambar } from "../commands/game/tebakgambar";
import { checkTebakKabupaten } from "../commands/game/tebakkabupaten";
import { checkTebakKalimat } from "../commands/game/tebakkalimat";
import { checkTebakKata } from "../commands/game/tebakkata";
import { checkTebakKimia } from "../commands/game/tebakkimia";
import { checkTebakLirik } from "../commands/game/tebaklirik";
import { checkTebakMemberJKT48 } from "../commands/game/tebakmemberjkt48";
import { checkTebakTebakan } from "../commands/game/tebaktebakan";
import { checkTebakWaifu } from "../commands/game/tebakwaifu";
import { checkTekaTeki } from "../commands/game/tekateki";
import { checkTrivia } from "../commands/game/trivia";

const checkers: ((jid: string, text: string, sender: string) => string | null)[] = [
  checkMathAnswer,
  checkTebakKata,
  checkTrivia,
  checkTebakBendera,
  checkTebakGambar,
  checkTebakAnime,
  checkTebakWaifu,
  checkTebakMemberJKT48,
  checkFamily100,
  checkAsahOtak,
  checkSiapakahAku,
  checkSusunKata,
  checkTebakKabupaten,
  checkTebakKalimat,
  checkTebakKimia,
  checkTebakTebakan,
  checkTebakLirik,
  checkTekaTeki,
  checkCakLontong,
];

export function checkGameAnswer(jid: string, text: string, sender: string): string | null {
  const input = text.trim();
  if (!input) return null;
  for (const fn of checkers) {
    const result = fn(jid, input, sender);
    if (result) return result;
  }
  return null;
}
