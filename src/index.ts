// import { Telegraf } from 'telegraf';
// import { about } from './commands';
// import { greeting } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
// import { development, production } from './core';
const superagent = require('superagent');
const cheerio = require('cheerio');


// momo http请求实例
const momoRequest = superagent.agent();
momoRequest
  .set("Cookie", process.env.M_COOKIE)
  .set("Host", process.env.M_HOST)


// oulu http请求实例
const ouluRequest = superagent.agent();
ouluRequest
  .set("Authorization", process.env.OU_LU_AUTH)


// const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

// const bot = new Telegraf(BOT_TOKEN);

// bot.command('about', about());
// bot.on('message', greeting());

//prod mode (Vercel)
// export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
//   // await production(req, res, bot);
// };

async function handleMomo() {
  const res = await momoRequest.get(process.env.M_URL);
  // 解析html
  const $ = cheerio.load(res.text);
  // 获取词库文本
  const momoOriginalWords = $('#content').text();
  // 词库文本转数组
  const momoWordList = momoOriginalWords.replaceAll(/\n/g, ' ').split(' ');
  // 词库标题
  const title = encodeURIComponent($('#title').val());
  // 词库简介
  const brief = encodeURIComponent($('#brief').val());
  // 标签id
  let tagIds: any = [...$('#notepadTags a.active').map((_: number, item: any) => $(item).data('tag'))];
  // 词库是否有标签
  if (tagIds.length) {
    // 标签ids处理为发送参数格式
    tagIds = tagIds.reduce((total: string, current: number) => `${total}&${encodeURIComponent('tag[]')}=${current}`, '')
  } else {
    tagIds = '';
  }

  return {
    title,
    brief,
    momoOriginalWords,
    momoWordList,
    tagIds,
  }
}


async function handleOulu() {
  const ouluWordsRes = await ouluRequest.get(process.env.OU_LU_ALL_WORDS);
  const ouLuWords = ouluWordsRes.body.data.map((item: any) => item.word)
  return { ouLuWords }
}

export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  const {
    title,
    brief,
    momoOriginalWords,
    momoWordList,
    tagIds,
  } = await handleMomo();

  const { ouLuWords } = await handleOulu();

  // 处理新增的单词 两个词库的差集
  let addWords = ouLuWords.filter((word: string) => !momoWordList.includes(word));
  if (addWords.length) {
    //新增的单词处理为发送参数格式
    addWords = addWords.reduce((total: string, current: string) => `${total}${encodeURIComponent('\n')}${current}`, '')
  } else {
    addWords = ''
  }

  // momo原始单词加新增的单词
  const content = encodeURIComponent(momoOriginalWords) + addWords;

  const data = `id=3187706&title=${title}&brief=${brief}&content=${content}&is_private=false${tagIds}`;

  const saveRes = await momoRequest
    .post('https://www.maimemo.com/notepad/save')
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('Content-Length', data.length)
    .send(data);
  const saveResJson = JSON.parse(saveRes.text);
  if (saveResJson.valid === 1) {
    console.log('保存成功');
  }
  // 处理 Vercel Serverless Function 响应，避免部署后访问超时
  ENVIRONMENT === 'production' && res.status(200).json('Listening to bot events...');
}

// @ts-ignore
startVercel();
//dev mode
// ENVIRONMENT !== 'production' && development(bot);
