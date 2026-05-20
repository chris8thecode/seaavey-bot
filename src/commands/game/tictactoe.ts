import { defineCommand } from "@/core/types";
import { addXp } from "@/infra/database";
import { getRandomItem } from "@/utils/helper";

const sessions = new Map<
  string,
  {
    board: string[];
    playerX: string;
    playerO: string;
    turn: string;
    timeout: Timer;
  }
>();

function renderBoard(board: string[]): string {
  return `${board[0]}│${board[1]}│${board[2]}\n─┼─┼─\n${board[3]}│${board[4]}│${board[5]}\n─┼─┼─\n${board[6]}│${board[7]}│${board[8]}`;
}

function checkWin(board: string[], mark: string): boolean {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  return wins.some(
    ([a, b, c]) =>
      board[a as number] === mark && board[b as number] === mark && board[c as number] === mark,
  );
}

function botMove(board: string[]): number {
  const empty = board.map((v, i) => (v !== "X" && v !== "O" ? i : -1)).filter((i) => i !== -1);
  for (const i of empty) {
    board[i] = "O";
    if (checkWin(board, "O")) {
      board[i] = String(i + 1);
      return i;
    }
    board[i] = String(i + 1);
  }
  for (const i of empty) {
    board[i] = "X";
    if (checkWin(board, "X")) {
      board[i] = String(i + 1);
      return i;
    }
    board[i] = String(i + 1);
  }
  if (empty.includes(4)) return 4;
  return getRandomItem(empty) ?? 0;
}

export default defineCommand({
  name: "tictactoe",
  description: "Main tic-tac-toe lawan bot atau member lain",
  handler: async (sock, msg) => {
    const session = sessions.get(msg.jid);

    if (!session) {
      const target = msg.mentioned?.[0] || (msg.args[0] === "bot" ? "bot" : null);
      if (msg.args.length > 0 && !target) {
        return msg.reply("Ketik .tictactoe atau .tictactoe @tag untuk mulai.");
      }

      const isBot = (target || "bot") === "bot";
      const finalTarget = target || "bot";

      const board = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
      const timeout = setTimeout(() => {
        sessions.delete(msg.jid);
        sock.sendMessage(msg.jid, { text: "⏰ Waktu habis! Game Tic-Tac-Toe dihentikan." });
      }, 120_000);

      sessions.set(msg.jid, {
        board,
        playerX: msg.sender,
        playerO: finalTarget,
        turn: msg.sender,
        timeout,
      });

      return msg.send({
        text: `🎮 *Tic-Tac-Toe*\n❌: @${msg.sender.split("@")[0]}\n⭕: ${isBot ? "Bot" : `@${finalTarget.split("@")[0]}`}\n\n${renderBoard(board)}\n\nGiliran: @${msg.sender.split("@")[0]}\nKetik .tictactoe [1-9]`,
        mentions: [msg.sender, ...(isBot ? [] : [finalTarget])],
      });
    }

    if (msg.args[0] === "nyerah") {
      if (msg.sender !== session.playerX && msg.sender !== session.playerO) return;
      clearTimeout(session.timeout);
      sessions.delete(msg.jid);
      return msg.reply("🏳️ Game dihentikan.");
    }

    if (msg.sender !== session.turn) {
      return msg.send({
        text: `❌ Bukan giliranmu! Tunggu @${session.turn.split("@")[0]}`,
        mentions: [session.turn],
      });
    }

    const pos = Number(msg.args[0]) - 1;
    if (
      Number.isNaN(pos) ||
      pos < 0 ||
      pos > 8 ||
      session.board[pos] === "X" ||
      session.board[pos] === "O"
    ) {
      return msg.reply("❌ Posisi tidak valid! Pilih 1-9 yang masih kosong.");
    }

    const mark = msg.sender === session.playerX ? "X" : "O";
    session.board[pos] = mark;

    if (checkWin(session.board, mark)) {
      clearTimeout(session.timeout);
      sessions.delete(msg.jid);
      addXp(msg.sender, 20);
      return msg.send({
        text: `${renderBoard(session.board)}\n\n🎉 @${msg.sender.split("@")[0]} Menang! (+20 XP)`,
        mentions: [msg.sender],
      });
    }

    if (!session.board.some((v) => v !== "X" && v !== "O")) {
      clearTimeout(session.timeout);
      sessions.delete(msg.jid);
      return msg.reply(`${renderBoard(session.board)}\n\n🤝 Seri!`);
    }

    if (session.playerO === "bot") {
      const botIdx = botMove(session.board);
      session.board[botIdx] = "O";

      if (checkWin(session.board, "O")) {
        clearTimeout(session.timeout);
        sessions.delete(msg.jid);
        return msg.reply(`${renderBoard(session.board)}\n\n😢 Bot menang!`);
      }

      if (!session.board.some((v) => v !== "X" && v !== "O")) {
        clearTimeout(session.timeout);
        sessions.delete(msg.jid);
        return msg.reply(`${renderBoard(session.board)}\n\n🤝 Seri!`);
      }

      session.turn = session.playerX;
    } else {
      session.turn = msg.sender === session.playerX ? session.playerO : session.playerX;
    }

    session.timeout.refresh();
    await msg.send({
      text: `${renderBoard(session.board)}\n\nGiliran: @${session.turn.split("@")[0]}`,
      mentions: [session.turn],
    });
  },
});
