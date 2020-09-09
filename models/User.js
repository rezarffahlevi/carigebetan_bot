
var mongoose = require('mongoose');
var validation = require('../utils/validation');
var moment = require('moment');

var UserSchema = new mongoose.Schema({
  userId: { type: String, required: validation('required'), unique: true, trim: true, minlength: [2, validation('minChar')] },
  username: { type: String, trim: true, },
  fullName: { type: String, trim: true, },
  gender: { type: String, enum: { values: ['L', 'P', null], message: validation('enum') } },
  age: { type: Number, trim: true, default: 0 },
  partner: {
    userId: { type: String, trim: true, minlength: [2, validation('minChar')] },
    username: { type: String, trim: true, },
    fullName: { type: String, trim: true, },
    gender: { type: String, enum: { values: ['L', 'P', null], message: validation('enum') } },
    age: { type: Number, trim: true, },
    isBlocked: { type: Boolean, enum: { values: [1, 0], message: validation('enum') } },
    matchDate: { type: Date }
  },
  lastUpdate: { type: Date, default: Date.now },
  historyMatch: { type: Array },
  status: { type: String, default: 'notReady' },
  isBlocked: { type: Boolean, enum: { values: [1, 0], default: 0, message: validation('enum') } },
}, { collection: 'users', versionKey: false });

UserSchema.set('toObject', { virtuals: true })
UserSchema.set('toJSON', {
  virtuals: true, transform: function (doc, ret) {
    // delete ret._id; delete ret.last_login
  }
})


// UserSchema.pre('save', function (next) {
//   const data = this;
//   next();
// });

// UserSchema.pre('findOneAndUpdate', function (next) {
//   const data = this._update;
//   next();
// });

UserSchema.virtual('date')
  .get(function () {
    return moment(this.last_login).format("YYYY-MM-DD HH:mm:ss");
  });

mongoose.model('User', UserSchema);


module.exports = mongoose.model('User');