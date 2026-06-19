/**
 * @module interactive
 * @description WhatsApp Interactive Message Builder
 * @author Muhammad Adriansyah (Seaavey)
 * @repository https://github.com/seaavey/seaavey-bot
 * @license MIT
 */

import {
  generateMessageID,
  prepareWAMessageMedia,
  proto,
  type WAMediaUpload,
  type WASocket,
} from "baileys";

export type Button =
  | { name: "quick_reply"; params: { display_text: string; id: string } }
  | { name: "cta_url"; params: { display_text: string; url: string } }
  | {
      name: "single_select";
      params: {
        title: string;
        sections: {
          title: string;
          rows: { title: string; id: string; description?: string }[];
        }[];
      };
    };

export interface InteractiveOptions {
  body: string;
  footer?: string;
  header?: {
    title?: string;
    subtitle?: string;
    image?: WAMediaUpload;
    video?: WAMediaUpload;
    jpegThumbnail?: Uint8Array;
  };
  buttons: Button[];
  mentions?: string[];
}

export async function sendInteractive(sock: WASocket, jid: string, opts: InteractiveOptions) {
  const msg: proto.Message.IInteractiveMessage = {
    body: { text: opts.body },
    nativeFlowMessage: {
      buttons: opts.buttons.map((b) => ({
        name: b.name,
        buttonParamsJson: JSON.stringify(b.params),
      })),
    },
  };

  if (opts.footer) msg.footer = { text: opts.footer };
  if (opts.mentions) msg.contextInfo = { mentionedJid: opts.mentions };

  if (opts.header) {
    const header: proto.Message.InteractiveMessage.IHeader = {};
    if (opts.header.title) header.title = opts.header.title;
    if (opts.header.subtitle) header.subtitle = opts.header.subtitle;

    if (opts.header.image) {
      const media = await prepareWAMessageMedia(
        { image: opts.header.image },
        { upload: sock.waUploadToServer },
      );
      header.imageMessage = media.imageMessage ?? null;
      header.hasMediaAttachment = true;
    } else if (opts.header.video) {
      const media = await prepareWAMessageMedia(
        { video: opts.header.video },
        { upload: sock.waUploadToServer },
      );
      header.videoMessage = media.videoMessage ?? null;
      header.hasMediaAttachment = true;
    } else if (opts.header.jpegThumbnail) {
      header.jpegThumbnail = opts.header.jpegThumbnail;
      header.hasMediaAttachment = true;
    }

    msg.header = header;
  }

  const interactiveMessage = proto.Message.InteractiveMessage.create(msg);

  const message: proto.IMessage = {
    viewOnceMessage: { message: { interactiveMessage } },
  };

  await sock.relayMessage(jid, message, {
    messageId: generateMessageID(),
    additionalNodes: [
      {
        tag: "biz",
        attrs: {},
        content: [
          {
            tag: "interactive",
            attrs: { type: "native_flow", v: "1" },
            content: [{ tag: "native_flow", attrs: { v: "9", name: "mixed" } }],
          },
        ],
      },
    ],
  });
}
