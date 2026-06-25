import type { WASocket } from "baileys";
import { logger } from "@/core/logger";
import {
  getPendingReminders,
  getPendingSchedules,
  markReminderDone,
  markScheduleDone,
} from "@/infra/database";
import { getNumber } from "@/utils/helper";
let reminderInterval: ReturnType<typeof setInterval> | null = null;
let scheduleInterval: ReturnType<typeof setInterval> | null = null;

export function startSchedulers(sock: WASocket) {
  // Clear any existing intervals to prevent memory leaks and duplicate timers on reconnect
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
  if (scheduleInterval) {
    clearInterval(scheduleInterval);
    scheduleInterval = null;
  }

  // Reminder checker
  reminderInterval = setInterval(async () => {
    try {
      const reminders = getPendingReminders();
      for (const r of reminders) {
        markReminderDone(r.id);
        await sock.sendMessage(r.chatJid, {
          text: `⏰ *Reminder!*\n\n@${getNumber(r.jid)}: ${r.message}`,
          mentions: [r.jid],
        });
      }
    } catch (e) {
      logger.error(`Scheduler Error (Reminder): ${e}`);
    }
  }, 30_000);

  // Schedule checker
  scheduleInterval = setInterval(async () => {
    try {
      const schedules = getPendingSchedules();
      for (const s of schedules) {
        markScheduleDone(s.id);
        await sock.sendMessage(s.chatJid, {
          text: `📢 *Scheduled Message*\n\n${s.message}`,
        });
      }
    } catch (e) {
      logger.error(`Scheduler Error (Schedule): ${e}`);
    }
  }, 30_000);
}
