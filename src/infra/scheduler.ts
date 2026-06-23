import type { WASocket } from "baileys";
import { logger } from "@/core/logger";
import {
  getPendingReminders,
  getPendingSchedules,
  markReminderDone,
  markScheduleDone,
} from "@/infra/database";
import { getNumber } from "@/utils/helper";
export function startSchedulers(sock: WASocket) {
  // Reminder checker
  setInterval(async () => {
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
  setInterval(async () => {
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
