import { describe, expect, it, mock, beforeAll } from "bun:test";
import type { WAMessage, WASocket } from "baileys";
import type { MessageContext } from "@/handlers/message-context";
import type { MessageResolver } from "@/utils/message-resolver";

type GameCheckerFn = (
  jid: string,
  text: string,
  sender: string,
) => Promise<string | null> | string | null;

let mockMathAnswer: GameCheckerFn = () => null;
let mockTebakKata: GameCheckerFn = () => null;
let mockTrivia: GameCheckerFn = () => null;

// Mock the checkers using relative paths
mock.module("../../commands/game/math", () => ({
  checkMathAnswer: (jid: string, text: string, sender: string) => mockMathAnswer(jid, text, sender),
}));

mock.module("../../commands/game/tebakkata", () => ({
  checkTebakKata: (jid: string, text: string, sender: string) => mockTebakKata(jid, text, sender),
}));

mock.module("../../commands/game/trivia", () => ({
  checkTrivia: (jid: string, text: string, sender: string) => mockTrivia(jid, text, sender),
}));

let gameAnswerMiddleware: (ctx: MessageContext) => Promise<"next" | "stop">;

beforeAll(async () => {
  // Import the middleware
  const middlewareModule = await import("@/middleware/game-answer");
  gameAnswerMiddleware = middlewareModule.gameAnswerMiddleware;
});

describe("Async Game Middleware Stress & Concurrency Tests", () => {
  // Test 1: Concurrency and Race Conditions in Message Ordering
  it("should demonstrate that concurrent messages can be processed out of order (race condition in message flow)", async () => {
    const replies: string[] = [];

    const mockSock = {
      sendMessage: async (_jid: string, content: { text: string }) => {
        replies.push(content.text);
        return {} as WAMessage;
      },
    } as unknown as WASocket;

    // Message 1: triggers a slow checker (50ms delay)
    mockMathAnswer = async (_jid: string, text: string) => {
      if (text === "slow") {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return "slow_response";
      }
      return null;
    };

    // Message 2: triggers a fast checker (5ms delay)
    mockTebakKata = async (_jid: string, text: string) => {
      if (text === "fast") {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return "fast_response";
      }
      return null;
    };

    mockTrivia = () => null;

    const ctx1: MessageContext = {
      sock: mockSock,
      raw: {} as WAMessage,
      parse: { jid: "chat_1", body: "slow", sender: "user_1" } as unknown as MessageResolver,
    };

    const ctx2: MessageContext = {
      sock: mockSock,
      raw: {} as WAMessage,
      parse: { jid: "chat_1", body: "fast", sender: "user_1" } as unknown as MessageResolver,
    };

    // Send Message 1 first, then Message 2 immediately after
    const p1 = gameAnswerMiddleware(ctx1);
    // Wait 10ms so Message 1 definitely starts first, then start Message 2
    await new Promise((resolve) => setTimeout(resolve, 10));
    const p2 = gameAnswerMiddleware(ctx2);

    await Promise.all([p1, p2]);

    // Message 2 (fast) finished before Message 1 (slow)
    // So the replies list will have "fast_response" before "slow_response"
    expect(replies).toEqual(["fast_response", "slow_response"]);
  });

  // Test 2: Double-Solve / Race Condition in State Mutation
  it("should demonstrate double-solve race condition when two concurrent identical answers are processed", async () => {
    let solveCount = 0;
    let isActive = true;

    // Simulate an async checker with an async read-modify-write pattern (e.g. database read then write)
    mockMathAnswer = async (_jid: string, text: string) => {
      if (text === "correct") {
        // 1. Read state asynchronously
        await new Promise((resolve) => setTimeout(resolve, 10));
        const currentActive = isActive;

        // 2. Write/mutate state asynchronously (simulating latency before commit)
        await new Promise((resolve) => setTimeout(resolve, 10));
        if (currentActive) {
          solveCount++;
          isActive = false; // mark solved in DB
          return "correct_win";
        }
      }
      return null;
    };
    mockTebakKata = () => null;
    mockTrivia = () => null;

    const replies: string[] = [];
    const mockSock = {
      sendMessage: async (_jid: string, content: { text: string }) => {
        replies.push(content.text);
        return {} as WAMessage;
      },
    } as unknown as WASocket;

    const ctx1: MessageContext = {
      sock: mockSock,
      raw: {} as WAMessage,
      parse: { jid: "chat_1", body: "correct", sender: "user_1" } as unknown as MessageResolver,
    };

    const ctx2: MessageContext = {
      sock: mockSock,
      raw: {} as WAMessage,
      parse: { jid: "chat_1", body: "correct", sender: "user_2" } as unknown as MessageResolver,
    };

    // Send both correct answers concurrently
    await Promise.all([gameAnswerMiddleware(ctx1), gameAnswerMiddleware(ctx2)]);

    // Because both requests were processed concurrently and the state check/mutation
    // was delayed by async operations, both saw isActive as true!
    // This results in a double-solve: solveCount is 2, and both users get a win message.
    expect(solveCount).toBe(2);
    expect(replies).toEqual(["correct_win", "correct_win"]);
  });

  // Test 3: Slow Async Checker Latency Impact (Cross-Chat Isolation)
  it("should ensure that a slow checker in Chat A does not block a fast checker in Chat B", async () => {
    const startTimes: Record<string, number> = {};
    const endTimes: Record<string, number> = {};

    mockMathAnswer = async (jid: string, text: string) => {
      if (jid === "chat_a" && text === "solve") {
        startTimes["chat_a"] = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 100)); // slow
        endTimes["chat_a"] = Date.now();
        return "response_a";
      }
      return null;
    };

    mockTebakKata = async (jid: string, text: string) => {
      if (jid === "chat_b" && text === "solve") {
        startTimes["chat_b"] = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 5)); // fast
        endTimes["chat_b"] = Date.now();
        return "response_b";
      }
      return null;
    };
    mockTrivia = () => null;

    const mockSock = {
      sendMessage: async () => ({}) as WAMessage,
    } as unknown as WASocket;

    const ctxA: MessageContext = {
      sock: mockSock,
      raw: {} as WAMessage,
      parse: { jid: "chat_a", body: "solve", sender: "user_1" } as unknown as MessageResolver,
    };

    const ctxB: MessageContext = {
      sock: mockSock,
      raw: {} as WAMessage,
      parse: { jid: "chat_b", body: "solve", sender: "user_2" } as unknown as MessageResolver,
    };

    // Start Chat A first, then start Chat B immediately after
    const pA = gameAnswerMiddleware(ctxA);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const pB = gameAnswerMiddleware(ctxB);

    await Promise.all([pA, pB]);

    // Chat B should finish way before Chat A, even though Chat A started first.
    // This shows that the event loop is not blocked and other chats remain responsive.
    const endB = endTimes["chat_b"] ?? 0;
    const endA = endTimes["chat_a"] ?? 0;
    const startB = startTimes["chat_b"] ?? 0;

    expect(endB).toBeLessThan(endA);
    const chatBDuration = endB - startB;
    expect(chatBDuration).toBeLessThan(30); // Should be very fast
  });

  // Test 4: Memory Leak Test under Stress
  it("should not leak memory when processing a high volume of concurrent messages", async () => {
    mockMathAnswer = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      return null;
    };
    mockTebakKata = () => null;
    mockTrivia = () => null;

    const mockSock = {
      sendMessage: async () => ({}) as WAMessage,
    } as unknown as WASocket;

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    const initialMemory = process.memoryUsage().heapUsed;

    const promises = [];
    for (let i = 0; i < 1000; i++) {
      const ctx: MessageContext = {
        sock: mockSock,
        raw: {} as WAMessage,
        parse: {
          jid: `chat_${i}`,
          body: "hello",
          sender: `user_${i}`,
        } as unknown as MessageResolver,
      };
      promises.push(gameAnswerMiddleware(ctx));
    }

    await Promise.all(promises);

    if (global.gc) {
      global.gc();
    }
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryDiffKB = (finalMemory - initialMemory) / 1024;

    // eslint-disable-next-line no-console
    console.log(
      `Memory footprint change after 1000 concurrent middleware executions: ${memoryDiffKB.toFixed(2)} KB`,
    );

    // Allow a reasonable memory growth for test environment, but shouldn't be massive (e.g. < 20MB)
    expect(memoryDiffKB).toBeLessThan(20 * 1024); // < 20MB
  });
});
