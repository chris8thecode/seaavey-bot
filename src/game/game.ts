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

export function checkGameAnswer(jid: string, text: string, sender: string): string | null {
  const input = text.trim();
  if (!input) return null;

  return (
    checkMathAnswer(jid, input, sender) ||
    checkTebakKata(jid, input, sender) ||
    checkTrivia(jid, input, sender) ||
    checkTebakBendera(jid, input, sender) ||
    checkTebakGambar(jid, input, sender) ||
    checkTebakAnime(jid, input, sender) ||
    checkTebakWaifu(jid, input, sender) ||
    checkTebakMemberJKT48(jid, input, sender) ||
    checkFamily100(jid, input, sender) ||
    checkAsahOtak(jid, input, sender) ||
    checkSiapakahAku(jid, input, sender) ||
    checkSusunKata(jid, input, sender) ||
    checkTebakKabupaten(jid, input, sender) ||
    checkTebakKalimat(jid, input, sender) ||
    checkTebakKimia(jid, input, sender) ||
    checkTebakTebakan(jid, input, sender) ||
    checkTebakLirik(jid, input, sender) ||
    checkTekaTeki(jid, input, sender) ||
    checkCakLontong(jid, input, sender)
  );
}
