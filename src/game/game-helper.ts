import { addXp } from "@/infra/database";

export interface GameSession {
  answer: string;
  hint: string;
  timeout: Timer;
  sender?: string;
}

export class GameManager {
  private sessions = new Map<string, GameSession>();

  constructor(private reward: number = 15) {}

  start(jid: string, answer: string, sender: string, onTimeout: () => void) {
    if (this.sessions.has(jid)) return false;
    const hint = answer.replace(/[a-zA-Z]/g, (l, i) => (i % 2 === 0 ? l : "_"));
    const timeout = setTimeout(() => {
      this.sessions.delete(jid);
      onTimeout();
    }, 60000);
    this.sessions.set(jid, { answer: answer.toLowerCase(), hint, timeout, sender });
    return true;
  }

  getHint(jid: string) {
    return this.sessions.get(jid)?.hint;
  }

  check(jid: string, text: string, sender: string) {
    const session = this.sessions.get(jid);
    if (!session || text.toLowerCase() === "hint") return null;
    if (!jid.endsWith("@g.us") && sender !== session.sender) return null;
    if (text.toLowerCase() !== session.answer) return null;
    clearTimeout(session.timeout);
    this.sessions.delete(jid);
    addXp(sender, this.reward);
    return session.answer;
  }

  has(jid: string) {
    return this.sessions.has(jid);
  }
}
