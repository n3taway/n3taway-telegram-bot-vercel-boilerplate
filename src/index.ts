import { Telegraf } from 'telegraf';
import { about } from './commands';
import { greeting } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
const superagent = require('superagent');


const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

bot.command('about', about());
bot.on('message', greeting());

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
console.log(123);

async function main() {
  const res = await superagent.get(process.env.M_URL)
  .set("Cookie", process.env.M_COOKIE)
  .set("Host", process.env.M_HOST)
  
  console.log('🚧 -> file: index.ts。 res: ', res.text);
}

main();
//dev mode
ENVIRONMENT !== 'production' && development(bot);
