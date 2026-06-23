import axios from "axios";
import * as cheerio from "cheerio";

import type { ScraperResult } from "./index";
import { scraperError, scraperSuccess } from "./index";

const SERVER = "http://51.91.153.164";
const HOST = "en.akinator.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export interface AkinatorAnswer {
  index: number;
  label: string;
}

export interface AkinatorSession {
  session: string;
  signature: string;
  question: string;
  step: number;
  progression: number;
  answers: AkinatorAnswer[];
}

export interface AkinatorGuess {
  name: string;
  description: string;
  photo: string;
  id: string;
  baseId: string;
}

export interface AkinatorAnswerResult {
  guess?: AkinatorGuess;
  session?: AkinatorSession;
}

const ANSWERS_LABELS = ["Yes", "No", "I don't know", "Probably", "Probably not"];

function parseGameHtml(html: string): AkinatorSession {
  const $ = cheerio.load(html);

  const session =
    $('input[name="session"][value]').last().attr("value")?.trim() || "";
  const signature =
    $('input[name="signature"][value]').last().attr("value")?.trim() || "";
  const question = $("#question-label").text().trim();

  if (!session || !signature || !question) {
    throw new Error("Gagal parsing halaman game");
  }

  return {
    session,
    signature,
    question,
    step: 0,
    progression: 0,
    answers: ANSWERS_LABELS.map((label, index) => ({ index, label })),
  };
}

export async function akinatorStart(
  sid = 1,
  childMode = false,
): Promise<ScraperResult<AkinatorSession>> {
  try {
    const { data } = await axios.post(
      `${SERVER}/game`,
      new URLSearchParams({ sid: String(sid), cm: String(childMode) }),
      {
        headers: {
          "user-agent": UA,
          "content-type": "application/x-www-form-urlencoded",
          host: HOST,
        },
        timeout: 15000,
      },
    );

    const session = parseGameHtml(data);
    return scraperSuccess(session);
  } catch (e: unknown) {
    const err = e as { message?: string };
    return scraperError(err.message || "Gagal memulai Akinator");
  }
}

export async function akinatorAnswer(
  session: AkinatorSession,
  answer: number,
): Promise<ScraperResult<AkinatorAnswerResult>> {
  try {
    const { data } = await axios.post(
      `${SERVER}/answer`,
      new URLSearchParams({
        step: String(session.step),
        progression: String(session.progression),
        sid: "1",
        cm: "false",
        answer: String(answer),
        step_last_proposition: "",
        session: session.session,
        signature: session.signature,
      }),
      {
        headers: {
          "user-agent": UA,
          "content-type": "application/x-www-form-urlencoded",
          "x-requested-with": "XMLHttpRequest",
          host: HOST,
        },
        timeout: 15000,
      },
    );

    if (data.completion === "KO") {
      return scraperError("Sesi tidak valid, mulai ulang game");
    }

    if (data.id_proposition) {
      return scraperSuccess({
        guess: {
          name: data.name_proposition,
          description: data.description_proposition,
          photo: data.photo,
          id: data.id_proposition,
          baseId: data.id_base_proposition,
        },
      });
    }

    return scraperSuccess({
      session: {
        session: session.session,
        signature: session.signature,
        question: data.question,
        step: Number(data.step),
        progression: Number(data.progression),
        answers: ANSWERS_LABELS.map((label, index) => ({ index, label })),
      },
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return scraperError(err.message || "Gagal menjawab pertanyaan");
  }
}

export async function akinatorExclude(
  session: AkinatorSession,
): Promise<ScraperResult<AkinatorSession>> {
  try {
    const { data } = await axios.post(
      `${SERVER}/exclude`,
      new URLSearchParams({
        step: String(session.step),
        sid: "1",
        cm: "false",
        progression: String(session.progression),
        session: session.session,
        signature: session.signature,
        sens: "1",
      }),
      {
        headers: {
          "user-agent": UA,
          "content-type": "application/x-www-form-urlencoded",
          "x-requested-with": "XMLHttpRequest",
          host: HOST,
        },
        timeout: 15000,
      },
    );

    return scraperSuccess({
      session: session.session,
      signature: session.signature,
      question: data.question,
      step: Number(data.step),
      progression: Number(data.progression),
      answers: ANSWERS_LABELS.map((label, index) => ({ index, label })),
    });
  } catch (e: unknown) {
    const err = e as { message?: string };
    return scraperError(err.message || "Gagal exclude tebakan");
  }
}
