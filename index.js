/*
* @R respa.news
* @R t.me/RespaNews
* @R License: MIT license
*/

import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";

dotenv.config();
const { BOT_TOKEN, LOGS_CHANNEL, ADMIN_ID } = process.env;

const BOT = new Telegraf(BOT_TOKEN);
const sessions = new Map();

BOT.start((ctx) => {
  ctx.reply("😏 Отправьте свою новость");
});

BOT.on("message", async (ctx) => {
  const from = ctx.from;
  const messageText = ctx.message.text || "[медиа/другое сообщение]";

  await BOT.telegram.sendMessage(
    LOGS_CHANNEL,
    `📝 Logger Message\n\nЛог: сообщение от @${from.username || from.first_name} (${from.id}):\n\n${messageText}`
  );

  if (String(from.id) === String(ADMIN_ID)) {
  const replyTo = sessions.get(from.id);

  if (replyTo) {
    await BOT.telegram.sendMessage(
      replyTo,
      `📩 Ответ от администратора:\n\n${messageText}`
    );

    await ctx.reply("✅ Ответ отправлен.");

    await BOT.telegram.sendMessage(
      LOGS_CHANNEL,
      `📤 Ответ от @${from.username || "admin"} (${from.id})\nПользователю: [user](tg://user?id=${replyTo})\n\n${messageText}`,
      { parse_mode: "Markdown" }
    );

    sessions.delete(from.id);
  }

    return;
  }

  await BOT.telegram.sendMessage(
    ADMIN_ID,
    `📬 Новая предложка от @${from.username || from.first_name} (${from.id}):\n\n${messageText}`,
    Markup.inlineKeyboard([
      Markup.button.callback("🤖 Ответить", `reply_${from.id}`)
    ])
  );

  await ctx.reply("✅ Спасибо! Ваше сообщение отправлено администратору");
});

BOT.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data.startsWith("reply_")) {
    const userId = data.split("_")[1];
    sessions.set(ctx.from.id, userId);

    await ctx.reply(`✍ Введи ответ пользователю (ID: ${userId})`);
  }
});

BOT.launch();
