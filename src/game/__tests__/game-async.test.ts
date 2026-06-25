import { describe, expect, it, mock, beforeAll, beforeEach, afterEach } from "bun:test";
import type { WAMessage, WASocket } from "baileys";
import type { MessageContext, MessageMiddleware } from "@/handlers/message-context";
import type { MessageResolver } from "@/utils/message-resolver";

type MockGameChecker = (
  jid: string,
  text: string,
  sender: string,
) => Promise<string | null> | string | null;

interface CustomGlobal {
  __activeMockMathAnswer?: MockGameChecker;
  __activeMockTebakKata?: MockGameChecker;
  __activeMockTrivia?: MockGameChecker;
}

const g = globalThis as unknown as CustomGlobal;

let mockMathAnswer: MockGameChecker = () => null;
let mockTebakKata: MockGameChecker = () => null;
let mockTrivia: MockGameChecker = () => null;

beforeEach(() => {
  g.__activeMockMathAnswer = (jid: string, text: string, sender: string) =>
    mockMathAnswer(jid, text, sender);
  g.__activeMockTebakKata = (jid: string, text: string, sender: string) =>
    mockTebakKata(jid, text, sender);
  g.__activeMockTrivia = (jid: string, text: string, sender: string) =>
    mockTrivia(jid, text, sender);
});

afterEach(() => {
  delete g.__activeMockMathAnswer;
  delete g.__activeMockTebakKata;
  delete g.__activeMockTrivia;
});

// Mock the first three checkers using correct relative path from test file
mock.module("../../commands/game/math", () => ({
  checkMathAnswer: (jid: string, text: string, sender: string) => {
    const activeMock = g.__activeMockMathAnswer;
    return activeMock ? activeMock(jid, text, sender) : null;
  },
}));

mock.module("../../commands/game/tebakkata", () => ({
  checkTebakKata: (jid: string, text: string, sender: string) => {
    const activeMock = g.__activeMockTebakKata;
    return activeMock ? activeMock(jid, text, sender) : null;
  },
}));

mock.module("../../commands/game/trivia", () => ({
  checkTrivia: (jid: string, text: string, sender: string) => {
    const activeMock = g.__activeMockTrivia;
    return activeMock ? activeMock(jid, text, sender) : null;
  },
}));

let checkGameAnswer: (jid: string, text: string, sender: string) => Promise<string | null>;
let gameAnswerMiddleware: MessageMiddleware;

beforeAll(async () => {
  // Dynamically import after mocking is registered
  const gameModule = await import("../game");
  checkGameAnswer = gameModule.checkGameAnswer;

  const middlewareModule = await import("@/middleware/game-answer");
  gameAnswerMiddleware = middlewareModule.gameAnswerMiddleware;
});

describe("Async Game Middleware & Checkers", () => {
  it("should resolve async checker returning a promise", async () => {
    mockMathAnswer = async (_jid: string, _text: string, _sender: string) => {
      return "async_math_win";
    };
    mockTebakKata = () => null;
    mockTrivia = () => null;

    const result = await checkGameAnswer("jid", "text", "sender");
    expect(result).toBe("async_math_win");
  });

  it("should handle mixed sync/async checkers sequentially and fall through correctly", async () => {
    // 1. Math (async) returns null
    mockMathAnswer = async () => null;
    // 2. TebakKata (sync) returns null
    mockTebakKata = () => null;
    // 3. Trivia (async) returns a result
    mockTrivia = async () => "trivia_win";

    const result = await checkGameAnswer("jid", "text", "sender");
    expect(result).toBe("trivia_win");
  });

  it("should isolate errors if a checker throws and continue to subsequent checkers", async () => {
    // 1. Math (async) throws an error
    mockMathAnswer = async () => {
      throw new Error("Math crashed!");
    };
    // 2. TebakKata (sync) throws an error
    mockTebakKata = () => {
      throw new Error("TebakKata crashed!");
    };
    // 3. Trivia (sync) returns a result successfully
    mockTrivia = () => "trivia_win_after_crashes";

    const result = await checkGameAnswer("jid", "text", "sender");
    expect(result).toBe("trivia_win_after_crashes");
  });

  it("should integrate correctly with gameAnswerMiddleware", async () => {
    mockMathAnswer = async () => "middleware_win";
    mockTebakKata = () => null;
    mockTrivia = () => null;

    interface SentMessage {
      jid: string;
      content: { text: string };
      options?: unknown;
    }
    const sent: SentMessage[] = [];
    const mockSock = {
      sendMessage: async (jid: string, content: { text: string }, options?: unknown) => {
        sent.push({ jid, content, options });
        return undefined;
      },
    } as unknown as WASocket;

    const ctx = {
      sock: mockSock,
      raw: {} as WAMessage,
      parse: {
        jid: "chat_jid",
        body: "my answer",
        sender: "sender_jid",
      } as unknown as MessageResolver,
    } as unknown as MessageContext;

    const middlewareResult = await gameAnswerMiddleware(ctx);
    expect(middlewareResult).toBe("stop");
    expect(sent.length).toBe(1);
    expect(sent[0]?.content?.text).toBe("middleware_win");
  });

  // Stress Test 1: Race condition where a second message wins because the first message is delayed by an async checker
  it("should demonstrate out-of-order execution race condition when a slow async checker delays a sync checker", async () => {
    let sessionActive = true;

    mockMathAnswer = async (_jid: string, _text: string, sender: string) => {
      const delay = sender === "sender1" ? 50 : 5;
      await new Promise((r) => setTimeout(r, delay));
      return null;
    };

    mockTebakKata = (_jid: string, text: string, sender: string) => {
      if (!sessionActive) return null;
      if (text === "correct_answer") {
        sessionActive = false;
        return `win_${sender}`;
      }
      return null;
    };
    mockTrivia = () => null;

    const p1 = checkGameAnswer("chat_1", "correct_answer", "sender1");
    await new Promise((r) => setTimeout(r, 10));
    const p2 = checkGameAnswer("chat_1", "correct_answer", "sender2");

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r2).toBe("win_sender2");
    expect(r1).toBeNull();
  });

  // Stress Test 2: Double Win vulnerability in async checkers
  it("should demonstrate double win vulnerability when the checker itself is async and has latency", async () => {
    let sessionActive = true;
    let winCount = 0;

    mockMathAnswer = async (_jid: string, text: string, sender: string) => {
      if (!sessionActive) return null;
      if (text === "correct_answer") {
        await new Promise((r) => setTimeout(r, 20));
        winCount++;
        sessionActive = false;
        return `win_${sender}`;
      }
      return null;
    };
    mockTebakKata = () => null;
    mockTrivia = () => null;

    const p1 = checkGameAnswer("chat_2", "correct_answer", "sender1");
    const p2 = checkGameAnswer("chat_2", "correct_answer", "sender2");

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toBe("win_sender1");
    expect(r2).toBe("win_sender2");
    expect(winCount).toBe(2);
  });

  // Stress Test 3: High concurrent messages & memory leak check
  it("should handle high concurrent messages and measure memory usage", async () => {
    mockMathAnswer = async (_jid: string, _text: string, _sender: string) => {
      await new Promise((r) => setTimeout(r, Math.random() * 10));
      return null;
    };
    mockTebakKata = () => null;
    mockTrivia = () => null;

    const initialMemory = process.memoryUsage().heapUsed;
    const promises = [];
    for (let i = 0; i < 500; i++) {
      promises.push(checkGameAnswer("chat_3", `answer_${i}`, `sender_${i}`));
    }

    const results = await Promise.all(promises);
    expect(results.every((r) => r === null)).toBe(true);

    if (
      typeof globalThis !== "undefined" &&
      "gc" in globalThis &&
      typeof (globalThis as { gc?: () => void }).gc === "function"
    ) {
      (globalThis as { gc: () => void }).gc();
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncreaseKB = (finalMemory - initialMemory) / 1024;
    expect(memoryIncreaseKB).toBeLessThan(10240); // Less than 10MB
  });
});
