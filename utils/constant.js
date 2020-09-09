const { Model } = require("mongoose");

const TOKEN = {
    cariGebetan: '1325888403:AAFrb_xKg8OMrKQfbSVBkSnwzWeNEv4MHnc',
    temanCerita: '1309684135:AAG5mHGkl_0NoLMIuU3anmzYMdPAtqsLlfY',
};

const DB_URL = {
  cariGebetan: 'mongodb://localhost/cari_gebetan',
  teman_bercerita: 'mongodb://localhost/teman_bercerita'
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