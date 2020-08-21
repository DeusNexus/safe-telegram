const { Telegraf } = require('telegraf');

module.exports = function(){
    console.log("Telegram Bot Instance created!")
    return new Telegraf(process.env.BOT_TOKEN, {
        username: 'SafeNetworkWallet_bot',
        channelMode: false
    })
}