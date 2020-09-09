const fs = require('fs');
const userModel = require('./models/User');
const CONSTANT = require('./utils/constant');
const TelegramBot = require('node-telegram-bot-api');
const User = require('./models/User');

// Create a bot that uses 'polling' to fetch new updates
const options = {
  polling: true
};

const bot = new TelegramBot(CONSTANT.TOKEN, options);
bot.on("polling_error", (msg) => console.log('no internet connection'));

const userData = {
  userId: null,
  username: null,
  fullName: null,
  gender: null,
  age: 0,
  partner: {},
  status: 'notReady',
  isBlocked: 0
}

const handleGender = async (msg) => {
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['/umur_ku'],
      ],
      one_time_keyboard: true
    })
  }

  const { from } = msg;
  const gender = msg.text.includes('Laki-Laki') ? 'L' : 'P';
  const run = await userModel.findOneAndUpdate({ userId: from.id }, { gender: gender });
  bot.sendMessage(from.id, 'Siap Kak!', opts);
}

const handleSearchPartner = async (msg) => {
  const opts = {
    reply_to_message_id: msg.message_id,
  }
  const isBoy = msg.text.includes('cerita_ke_cowo') ? 'L' : 'P';
  const from = msg.from;
  const check = await userModel.findOne({ userId: from.id });

  if (check.status != null && !check.status.includes('ready') && check.status != 'notReady') {
    bot.sendMessage(from.id, 'Kamu sudah berada dalam diskusi.\n\njika ingin mengganti lawan bicara ketik /selesai terlebih dahulu kemudian baru /cerita_ke_cewe atau /cerita_ke_cowo lagi.');
  }
  else if (check.gender == null) {
    const genderKeyboard = {
      reply_to_message_id: msg.message_id,
      reply_markup: JSON.stringify({
        keyboard: [
          [CONSTANT.CEWE],
          [CONSTANT.COWO]
        ],
        one_time_keyboard: true
      })
    };
    bot.sendMessage(from.id, 'Atur gender mu dulu kak', genderKeyboard);
  }
  else {

    const count = await userModel.find({ $or: [{ status: 'ready ' + check.gender }], gender: isBoy, userId: { $ne: from.id } });
    const random = Math.floor(Math.random() * count.length);

    const self = await userModel.findOne({ userId: from.id });
    const partner = await userModel.findOne({ $or: [{ status: 'ready ' + check.gender }], gender: isBoy, userId: { $ne: from.id } }).skip(random);

    const userObject = {
      userId: self.userId,
      username: self.username,
      fullName: self.fullName,
      gender: self.gender,
      age: self.age,
      isBlocked: self.isBlocked
    }

    const opts = {
      reply_to_message_id: msg.message_id,
    }

    console.log('search partner', partner);
    if (partner === null) {
      bot.sendMessage(msg.chat.id, 'Wah belum ada yang cocok nih, tunggu ya..', opts);
      await userModel.findOneAndUpdate({ userId: msg.from.id }, { ...userObject, status: 'ready ' + isBoy, partner: {} });
    }
    else {
      await userModel.findByIdAndUpdate({ _id: partner._id }, {
        status: 'chatting', partner: {
          ...userObject
        }
      });
      await userModel.findOneAndUpdate({ userId: from.id }, {
        ...userObject,
        status: 'chatting',
        partner: {
          userId: partner.userId,
          username: partner.username,
          fullName: partner.fullName,
          gender: partner.gender,
          age: partner.age,
          isBlocked: partner.isBlocked
        }
      });
      bot.sendMessage(partner.userId, 'Lawan bicara mu sudah siap, selamat bercerita :)');
      bot.sendMessage(from.id, 'Lawan bicara mu sudah siap, selamat bercerita :)', opts);
    }
  }
}

// Matches /start
bot.onText(/\/start/, async (msg) => {
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['/gender_ku'],
        ['/umur_ku']
      ],
      one_time_keyboard: true
    })
  };

  const from = msg.from;
  const fullName = from.first_name + ('last_name' in from ?  ' '+from.last_name:'');
  const run = await userModel.findOneAndUpdate({ userId: from.id }, {
    userId: from.id,
    username: '@' + from.username,
    fullName: fullName,
    lastUpdate: Date.now()
  });

  if (run === null) {
    const data = Object.assign({}, userData);
    data['userId'] = from.id;
    data['username'] = '@' + from.username;
    data['fullName'] = fullName;
    console.log('/start save', data)
    await new userModel(data).save();
  }

  bot.sendMessage(msg.chat.id, 'Hallo apa kabar? sebelum kamu bercerita, yuk atur jenis kelamin dan umur kamu dulu!', opts);
});

// Matches /start
bot.onText(/\/selesai/, async (msg) => {
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['/cerita_ke_cewe'],
        ['/cerita_ke_cowo']
      ],
      one_time_keyboard: true
    })
  }
  const self = await userModel.findOneAndUpdate({ userId: msg.from.id }, { status: 'notReady', partner: {} });
  if (self.status === 'chatting') {
    bot.sendMessage(msg.from.id, 'Semoga lekas membaik kak!  ;)\n\nKetik /cerita_ke_cewe atau /cerita_ke_cowo jika ingin bercerita lagi', opts);
    if (self.status != null) {
      const partner = await userModel.findOneAndUpdate({ userId: self.partner.userId }, { status: 'notReady', partner: {} })
      bot.sendMessage(partner.userId, 'Lawan bicaramu mengakhiri diskusi\n\nKetik /cerita_ke_cewe atau /cerita_ke_cowo jika ingin bercerita lagi');
    }
  }
  else if(self.status.includes('ready'))
    bot.sendMessage(msg.from.id, 'Okeey, \n\nKetik /cerita_ke_cewe atau /cerita_ke_cowo jika ingin bercerita lagi ya kak', opts);
  else
    bot.sendMessage(msg.from.id, 'Chat memang sudah berakhir', opts);
});

// Matches /love
bot.onText(/\/gender_ku/, (msg) => {
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        [CONSTANT.CEWE],
        [CONSTANT.COWO]
      ],
      one_time_keyboard: true
    })
  };
  bot.sendMessage(msg.chat.id, 'Apa jenis kelamin mu?', opts);
});

// Matches gender
bot.onText(/Saya Perempuan 🤲🏻/, handleGender)
bot.onText(/Saya Laki-Laki 🧓/, handleGender)
//match cerita
bot.onText(/\/cerita_ke_cewe/, handleSearchPartner)
bot.onText(/\/cerita_ke_cowo/, handleSearchPartner)

bot.onText(/\/umur_ku/, async (msg) => {
  const opts = {
    reply_to_message_id: msg.message_id,
  };
  const run = await userModel.findOneAndUpdate({ userId: msg.from.id }, { age: -1 });
  bot.sendMessage(msg.chat.id, 'Berapa umurmu?', opts);
});

// Matches /reply
bot.onText(/\/reply/, (msg) => {
  console.log('msg command', msg);

  const chatId = msg.text.split('|')[1];
  const text = msg.text.split('|')[2];
  // console.log('split', msg.text.split('/'), chatId, text)
  bot.sendMessage(chatId, text);
});

// Listen for any kind of message.
bot.on('message', async (msg) => {

  console.log('\nmsg', msg)
  // console.log('\nmsg', {
  //   from: {
  //     username: '@' + msg.from.username,
  //     fullName: msg.from.first_name,
  //   },
  //   date: new Date(msg.date).constructor(),
  //   text: 'text' in msg ? msg?.text : null,
  //   sticker: 'sticker' in msg ? msg?.sticker : null,
  //   voice: 'voice' in msg ? msg?.voice : null
  //   // text: msg.text,
  //   // sticker: msg?.sticker,
  //   // voice: msg?.voice,
  //   // photo:msg?.photo,
  //   // video_note:msg?.video_note,
  //   // audio:msg?.audio,
  //   // video:msg?.video,
  //   // doc:msg?.document,
  // });

  if (msg?.text?.substr(0, 1) != '/') {
    handleMsg(msg)
  }
});

const handleMsg = async (msg) => {
  const msgId = msg.message_id;
  const chatId = msg.chat.id;
  const name = msg.chat.first_name;
  const username = msg.chat.username;

  const from = msg.from;

  const user = await userModel.findOne({ userId: chatId });
  if (user === null) {
    const data = Object.assign({}, userData);
    data['userId'] = from.id;
    data['username'] = '@' + from.username;
    data['fullName'] = from.first_name;
    console.log('data', data)
    await new userModel(data).save();
  }
  const { partner } = user;

  console.log('partner', user.status === 'chatting' ? {
    to: {
      username: partner.username,
      fullName: partner.fullName,
    },
  } : 'bot')
  if (user.status === 'notReady' || user.status.includes('ready')) {
    if (user.age === -1) {
      if (isNaN(msg?.text)) {
        const opts = {
          reply_to_message_id: msg.message_id,
          reply_markup: JSON.stringify({
            keyboard: [
              ['/umur_ku'],
            ],
            one_time_keyboard: true
          })
        }
        const run = await userModel.findOneAndUpdate({ userId: msg.from.id }, { age: 0 });
        bot.sendMessage(chatId, `Maaf kak umur cuma bisa angka`, opts);
      }
      else {
        const opts = {
          reply_to_message_id: msg.message_id,
          reply_markup: JSON.stringify({
            keyboard: [
              ['/cerita_ke_cewe'],
              ['/cerita_ke_cowo']
            ],
            one_time_keyboard: true
          })
        }
        const run = await userModel.findOneAndUpdate({ userId: msg.from.id }, { age: Number(msg?.text) });
        bot.sendMessage(chatId, `Okeey kak!`, opts);
      }
    }
    else if (msg?.text === CONSTANT.COWO || msg?.text === CONSTANT.CEWE) {
      // bot.sendMessage(chatId, `Hallo kak, untuk memulai cerita bisa pilih /cerita_ke_cowo atau /cerita_ke_cewe terlebih dahulu`);
    }
    else {
      if (chatId != CONSTANT.MY_CHAT_ID)
        if ('text' in msg)
          bot.sendMessage(CONSTANT.MY_CHAT_ID, `chatId:${chatId}; from:${name + ' (@' + username + ')'};\n\n${msg?.text}`);
        else {
          bot.sendMessage(CONSTANT.MY_CHAT_ID, `chatId:${chatId}; from:${name + ' (@' + username + ')'};\n`);
          bot.sendSticker(CONSTANT.MY_CHAT_ID, msg.sticker.file_id)
        }

      if (user.status === 'notReady')
        bot.sendMessage(chatId, `Hallo kak, untuk memulai cerita bisa pilih /cerita_ke_cowo atau /cerita_ke_cewe terlebih dahulu..`);
      else
        bot.sendMessage(chatId, `Mohon tunggu ya kak, nanti kalo udah dapet partnernya kita kabarin! ;)`);
    }
  }
  else {
    if ('text' in msg) {
      // console.log('is', user.age)
      if (msg.text.toLowerCase() == 'id') {
        bot.sendMessage(chatId, `${chatId}`);
      }
      else if (user.age === -1) {
        if (isNaN(msg?.text)) {
          const opts = {
            reply_to_message_id: msg.message_id,
            reply_markup: JSON.stringify({
              keyboard: [
                ['/umur_ku'],
              ],
              one_time_keyboard: true
            })
          }
          const run = await userModel.findOneAndUpdate({ userId: msg.from.id }, { age: 0 });
          bot.sendMessage(chatId, `Maaf kak umur cuma bisa angka`, opts);
        }
        else {
          const opts = {
            reply_to_message_id: msg.message_id,
            reply_markup: JSON.stringify({
              keyboard: [
                ['/cerita_ke_cewe'],
                ['/cerita_ke_cowo']
              ],
              one_time_keyboard: true
            })
          }
          const run = await userModel.findOneAndUpdate({ userId: msg.from.id }, { age: Number(msg?.text) });
          bot.sendMessage(chatId, `Okeey kak!`, opts);
        }
      }
      else if (msg?.text === CONSTANT.COWO || msg?.text === CONSTANT.CEWE) {
        // bot.sendMessage(chatId, `Hallo kak, untuk memulai cerita bisa pilih /cerita_ke_cowo atau /cerita_ke_cewe terlebih dahulu`);
      }
      else {
        const opts = 'reply_to_message' in msg ? {
          reply_to_message_id: msg.reply_to_message.message_id - 1
        } : {}

        bot.sendMessage(partner.userId, msg.text, opts).catch(() => {
          bot.sendMessage(partner.userId, msg.text);
        });
      }
    }
    else if ('voice' in msg) {
      bot.sendVoice(partner.userId, msg.voice.file_id);
    }
    else if ('sticker' in msg) {
      bot.sendSticker(partner.userId, msg.sticker.file_id);
    }
    else if ('photo' in msg) {
      bot.sendPhoto(partner.userId, msg.photo[0].file_id);
    }
    else {
      bot.sendMessage(CONSTANT.MY_CHAT_ID, `chatId:${chatId}; from:${name + ' (@' + username + ')'};
  
  ${msg?.text}`);
    }
  }
}

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  console.log('echo', msg, match);

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});
