import { checkMathAnswer } from "../commands/game/math";
import { checkTebakKata } from "../commands/game/tebakkata";
import { checkTrivia } from "../commands/game/trivia";

export function checkGameAnswer(jid: string, text: string, sender: string): string | null {
  return (
    checkMathAnswer(jid, text, sender) ||
    checkTebakKata(jid, text, sender) ||
    checkTrivia(jid, text, sender)
  );
}
