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

function debug(msg: string, data?: Record<string, unknown>) {
  // biome-ignore lint/suspicious/noConsole: debug log
  console.log(`[TicTacToe] ${msg}`, data ?? "");
}

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
  name: "Tic Tac Toe",
  alias: ["ttt", "tic", "tictactoe"],
  description: "Main tic-tac-toe lawan bot atau member lain",
  handler: async (sock, msg) => {
    debug("Handler invoked", { jid: msg.jid, sender: msg.sender, args: msg.args, body: msg.body });
    const session = sessions.get(msg.jid);
    debug("Session lookup", { exists: !!session, jid: msg.jid });

    if (!session) {
      const target = msg.mentioned?.[0] || (msg.args[0] === "bot" ? "bot" : null);
      debug("No existing session, creating new", {
        target,
        mentioned: msg.mentioned,
        argsLen: msg.args.length,
      });

      if (msg.args.length > 0 && !target) {
        debug("Invalid start attempt", { args: msg.args });
        return msg.reply("Ketik .tictactoe atau .tictactoe @tag untuk mulai.");
      }

      const isBot = (target || "bot") === "bot";
      const finalTarget = target || "bot";
      debug("Session params", { isBot, finalTarget, creator: msg.sender });

      const board = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
      const timeout = setTimeout(() => {
        debug("Session expired", { jid: msg.jid });
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

      debug("Session created", {
        jid: msg.jid,
        playerX: msg.sender,
        playerO: finalTarget,
        turn: msg.sender,
      });
      debug("Session count", { total: sessions.size });

      return msg.send({
        text: `🎮 *Tic-Tac-Toe*\n❌: @${msg.sender.split("@")[0]}\n⭕: ${isBot ? "Bot" : `@${finalTarget.split("@")[0]}`}\n\n${renderBoard(board)}\n\nGiliran: @${msg.sender.split("@")[0]}\nKetik .tictactoe [1-9]`,
        mentions: [msg.sender, ...(isBot ? [] : [finalTarget])],
      });
    }

    if (msg.args[0] === "nyerah") {
      if (msg.sender !== session.playerX && msg.sender !== session.playerO) {
        debug("Surrender denied - not a player", {
          sender: msg.sender,
          playerX: session.playerX,
          playerO: session.playerO,
        });
        return;
      }
      debug("Surrender accepted", { sender: msg.sender });
      clearTimeout(session.timeout);
      sessions.delete(msg.jid);
      return msg.reply("🏳️ Game dihentikan.");
    }

    if (msg.sender !== session.turn) {
      debug("Turn mismatch", { sender: msg.sender, expectedTurn: session.turn });
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
      debug("Invalid position", { raw: msg.args[0], pos, board: session.board.join("") });
      return msg.reply("❌ Posisi tidak valid! Pilih 1-9 yang masih kosong.");
    }

    const mark = msg.sender === session.playerX ? "X" : "O";
    session.board[pos] = mark;
    debug("Move placed", {
      pos: pos + 1,
      mark,
      board: session.board.join(""),
      player: msg.sender === session.playerX ? "playerX" : "playerO",
    });

    if (checkWin(session.board, mark)) {
      debug("Win detected", { mark, winner: msg.sender, board: session.board.join("") });
      clearTimeout(session.timeout);
      sessions.delete(msg.jid);
      addXp(msg.sender, 20);
      return msg.send({
        text: `${renderBoard(session.board)}\n\n🎉 @${msg.sender.split("@")[0]} Menang! (+20 XP)`,
        mentions: [msg.sender],
      });
    }

    if (!session.board.some((v) => v !== "X" && v !== "O")) {
      debug("Draw detected", { board: session.board.join("") });
      clearTimeout(session.timeout);
      sessions.delete(msg.jid);
      return msg.reply(`${renderBoard(session.board)}\n\n🤝 Seri!`);
    }

    if (session.playerO === "bot") {
      debug("Bot turn - calculating move", { board: session.board.join("") });
      const botIdx = botMove(session.board);
      debug("Bot chose position", { pos: botIdx + 1, board: session.board.join("") });
      session.board[botIdx] = "O";
      debug("Bot placed O", { board: session.board.join("") });

      if (checkWin(session.board, "O")) {
        debug("Bot wins", { board: session.board.join("") });
        clearTimeout(session.timeout);
        sessions.delete(msg.jid);
        return msg.reply(`${renderBoard(session.board)}\n\n😢 Bot menang!`);
      }

      if (!session.board.some((v) => v !== "X" && v !== "O")) {
        debug("Draw after bot move", { board: session.board.join("") });
        clearTimeout(session.timeout);
        sessions.delete(msg.jid);
        return msg.reply(`${renderBoard(session.board)}\n\n🤝 Seri!`);
      }

      session.turn = session.playerX;
      session.timeout.refresh();
      debug("Turn switched back to playerX", { turn: session.turn });
      return msg.send({
        text: `${renderBoard(session.board)}\n\nGiliran: @${session.turn.split("@")[0]}`,
        mentions: [session.turn],
      });
    }

    session.turn = msg.sender === session.playerX ? session.playerO : session.playerX;
    session.timeout.refresh();
    debug("Turn switched", {
      newTurn: session.turn,
      sender: msg.sender,
      wasPlayerX: msg.sender === session.playerX,
    });
    await msg.send({
      text: `${renderBoard(session.board)}\n\nGiliran: @${session.turn.split("@")[0]}`,
      mentions: [session.turn],
    });
  },
});
