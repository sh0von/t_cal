const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const token = '5908484897:AAEzEuCZJ_gtyOT_Z3Xn9oZXNo3-HUjOc1c';
const bot = new TelegramBot(token, { polling: true });
const dataFile = './attendance.json';
let attendanceData = {};

if (fs.existsSync(dataFile)) {
  attendanceData = JSON.parse(fs.readFileSync(dataFile));
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to the Tuition Attendance Bot! \n\nTo record your attendance, use the /add command followed by the subject and the date in DD-MM format.\n\nFor example: /add math 04-01\n\nTo view your attendance for a specific subject, use the /view command followed by the subject.\n\nFor example: /view math\n\nTo view your attendance for a specific subject and month, use the individual /iview command followed by the subject and month in MM format.\n\nFor example: /iview math 01\n\nTo purge all data of specific subject ,use /purge command \n\n To purge data individually use /ipurge Math 02-12 command');
});

bot.onText(/\/add (.+) (\d{2}-\d{2})/, (msg, match) => {
  const chatId = msg.chat.id;
  const subject = match[1];
  const date = match[2];

  if (!attendanceData[subject]) {
    attendanceData[subject] = [];
  }

  attendanceData[subject].push(date);
  fs.writeFileSync(dataFile, JSON.stringify(attendanceData));

  bot.sendMessage(chatId, `Attendance added for ${subject} on ${date}`);
});

bot.onText(/\/iview (.+) (\d{2})/, (msg, match) => {
  const chatId = msg.chat.id;
  const subject = match[1];
  const month = match[2];

  if (!attendanceData[subject]) {
    bot.sendMessage(chatId, `You haven't attended ${subject} yet`);
  } else {
    const daysInMonth = [];
    attendanceData[subject].forEach((date) => {
      if (date.slice(3, 5) === month) {
        daysInMonth.push(date);
      }
    });

    if (daysInMonth.length === 0) {
      bot.sendMessage(chatId, `You haven't attended ${subject} in month ${month}`);
    } else {
      const numDays = daysInMonth.length;
      let message = `You have attended ${subject} for ${numDays} days in month ${month} on the following dates:\n`;

      daysInMonth.forEach((date) => {
        message += `${date}\n`;
      });

      bot.sendMessage(chatId, message);
    }
  }
});

bot.onText(/\/view (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const subject = match[1];

  if (!attendanceData[subject]) {
    bot.sendMessage(chatId, `You haven't attended ${subject} yet`);
  } else {
    const numDays = attendanceData[subject].length;
    let message = `You have attended ${subject} for ${numDays} days on the following dates:\n`;

    attendanceData[subject].forEach((date) => {
      message += `${date}\n`;
    });

    bot.sendMessage(chatId, message);
  }
});
bot.onText(/\/purge (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const subject = match[1];
  
    if (!attendanceData[subject]) {
      bot.sendMessage(chatId, `${subject} data does not exist.`);
    } else {
      attendanceData[subject] = [];
      fs.writeFileSync(dataFile, JSON.stringify(attendanceData));
      bot.sendMessage(chatId, `All attendance data for ${subject} has been deleted.`);
    }
  });

bot.onText(/\/ipurge (.+) (\d{2}-\d{2})/, (msg, match) => {
    const chatId = msg.chat.id;
    const subject = match[1];
    const date = match[2];
  
    if (!attendanceData[subject]) {
      bot.sendMessage(chatId, `${subject} data does not exist.`);
    } else {
      let index = attendanceData[subject].indexOf(date);
      while (index > -1) {
        attendanceData[subject].splice(index, 1);
        index = attendanceData[subject].indexOf(date);
      }
      fs.writeFileSync(dataFile, JSON.stringify(attendanceData));
      bot.sendMessage(chatId, `Attendance data for ${subject} on ${date} has been deleted.`);
    }
  });
  

bot.on('polling_error', (error) => {
  console.log(error);
});

console.log('Bot server started');
