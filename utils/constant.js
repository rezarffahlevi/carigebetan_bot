const { Model } = require("mongoose");

const TOKEN = {
    cariGebetan: 'YOUR_TOKEN',
    temanCerita: 'YOUR_TOKEN',
};

const DB_URL = {
  cariGebetan: 'YOUR_MONGO_DB_URL',
  teman_bercerita: 'YOUR_MONGO_DB_URL'
}

const tempId = {
  eca: '860112158',
  diah: '1280599092',
  rurul: '760852259',
  dewi: '1222313212',
  ilham: '875403852'
}

const CONSTANT = {
    TOKEN: TOKEN.cariGebetan,
    DB_URL: DB_URL.cariGebetan,
    MY_CHAT_ID: '642641630',
    
    CEWE: 'Saya Perempuan 🤲🏻',
    COWO: 'Saya Laki-Laki 🧓',

}

module.exports = CONSTANT;
