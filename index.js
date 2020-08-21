//DOTENV
require('dotenv').config();

//API
const Database = require('./api/Database');
const TelegramBot = require('./api/Bot');

//Commands
const initCommand = require('./handlers/initCommand');
const secretCommand = require('./handlers/secretCommand');
const balanceCommand = require('./handlers/balanceCommand');
const addcoinsCommand = require('./handlers/addcoinsCommand');
const sendCommand = require('./handlers/sendCommand');
const tipCommand = require('./handlers/tipCommand');
const keypairCommand = require('./handlers/keypairCommand');
const catCommand = require('./handlers/catCommand')
const dogCommand = require('./handlers/dogCommand')

//STATE CONSTANTS
const state = {
    maxCoins: 1000000000,
    initMessage: "To start using this bot, please do /init first!",
    example1: "safe://hnyynyqwcnqeh4s5ycmc6d35fq8p8gq7wyyxn9mnhtc8r757kttxkwfokobnc",
    example2: "safe://hbhydynydpfangy59jsqicmpgnqy1a9mf7ywjqiqtjque9fh6xap98jdaa",
    exampleSafeWallet: "safe://hbyyyybmyhqirrht8hntpej17jdxdmar4pwnkery77wbf14msdbwqs1kt1"
}

//Connect to DB
async function Main() {
    //Wait for DB to Load and then create a Telegram Bot instance
    await Database()
    const bot = TelegramBot()

    //Just welcome messaeg
    bot.start((ctx) => ctx.reply('Welcome to the Safenetwork Wallet Bot!'))

    //Needs more info
    bot.command('help', ctx => {
        console.log("HELP RUN")
        ctx.replyWithHTML(
            `<b>You will find an help overview about all the various commands and more.</b>`+
            `\n\n⚠️ <u>Important Notes</u>:`+
            `\nThe <code>/cat [url]</code> and <code>/dog [url]</code> are currently unable to view files!`+
            `\n\n<b>Commands</b>:`+
            `\n<b>Start</b> - Automatically run when you restart bot and displays a welcome message.`+
            `\nUsage: <code>/start</code>`+
            `\n\n<b>Help</b> - Shows the current help message.`+
            `\nUsage: <code>/help</code>`+
            `\n\n<b>Init</b> - Initializes a wallet for Telegram User which can be used to add/send/receive/tip coins.`+
            `\nUsage: <code>/init</code>`+
            `\n\n<b>Secret</b> - Shows the users wallet details including; Wallet SAFE-URL, Public Key and Secret Key.`+
            `\nUsage: <code>/secret</code>`+
            `\n\n<b>Balance</b> - Shows the current Safecoin balance of the user's wallet.`+
            `\nUsage: <code>/balance</code>`+
            `\n\n<b>Addcoins</b> - Add test coins to your wallet!`+
            `\nUsage: <code>/addcoins [amount]</code>`+
            `\n\n<b>Send</b> - Use to send Safecoins to other SAFE-URL addresses, without arguments it will display a help message.`+
            `\nUsage: <code>/send [amount] [safe-wallet url]</code>`+
            `\n\n<b>Tip</b> - Use to send a tip to a reply of a user who also has a SAFE Wallet, without arguments it will display a help message.`+
            `\nUsage: <code>/tip [amount]</code>`+
            `\n\n<b>Keypair</b> - Obtain keypairs from the CLI.`+
            `\nUsage: <code>/keypair</code>`+
            `\n\n<b>Cat</b> - View Folders/Files with cat, without arguments will display a help message.`+
            `\nUsage: <code>/cat [safe-url from folder or file]</code>`+
            `\n\n<b>Dog</b> - Inspect Folders/Files with dog, without arguments will display a help message.`+
            `\nUsage: <code>/dog [safe-url from folder or file]</code>`+
            `\n\n<b>More Information</b>:`+
            `\n<code>SafeNetwork Forum</code> - https://safenetforum.org/`+
            `\n<code>SafeNetwork Site</code> - https://safenetwork.org/`+
            `\n<code>GitHub</code> - https://github.com/DeusNexus/safe-telegram`+
            `\n\n<i>Please report any bugs/typos to @ThreeSteps</i>`,
            { disable_web_page_preview: true }
            ).catch(function(e){})
    })

    //Initialize User
    bot.hears(new RegExp(/\/init/s), async ctx => {
        console.log("INIT RUN")
        initCommand(ctx,state)
    })

    //Show user secrets
    bot.hears(new RegExp(/\/secret/s), async ctx => {
        console.log("SECRET RUN")
        secretCommand(ctx,state)
    })

    //Show user balance
    bot.hears(new RegExp(/\/balance/s), async (ctx) => {
        console.log("BALANCE RUN")
        balanceCommand(ctx,state)
    })

    //Allow user to add coins to his balance
    bot.hears('/addcoins', ctx => {
        ctx.replyWithHTML(`Try <code>/addcoins [amount]</code>, \nExample: <code>/addcoins 99</code>`).catch(function(e){})
    })
    bot.hears(new RegExp(/\/addcoins\s(\d{1,9})/s), async (ctx) => {
        console.log("ADDCOINS RUN")
        addcoinsCommand(ctx,state)
    })

    //Send coins to another user providing the amount and the safeurl
    bot.hears('/send', ctx => {
        ctx.replyWithHTML(`Try <code>/send [amount] [Receive SAFE URL]</code>, \nExample: <code>/send 25 ${state.exampleSafeWallet}</code>`)
        .catch(function(e){})
    })
    bot.hears(new RegExp(/\/send\s(\d{1,30})\s(safe:\/\/.*)/s), async (ctx) => {
        console.log("SEND RUN")
        sendCommand(ctx,state)
    })

    //Send a tip by replying to user message with command, the user you reply to already needs to have a wallet/initialized.
    bot.hears('/tip', ctx => {
        ctx.replyWithHTML(`Try <code>/tip [amount]</code> while replying to someones message, \n<i>this user already needs to have a SAFE Wallet</i> , e.g. <code>/tip 20</code>`).catch(function(e){})
    })
    bot.hears(new RegExp(/\/tip\s(\d{1,9})/s), async (ctx) => {
        console.log("TIP RUN")
        tipCommand(ctx,state)
    })

    //Obtain keypairs
    bot.hears(new RegExp(/\/keypair/s), async (ctx) => {
        console.log("KEYPAIR RUN")
        keypairCommand(ctx,state)
    })

    //Cat folders/files on the baby-fleming local network
    bot.hears('/cat', ctx => {
        ctx.replyWithHTML(`Try <code>/cat [safe://someurl]</code>, `+
        `\nExample 1: <code>/cat ${state.example1}</code>`+
        `\nExample 2: <code>/cat ${state.example2}</code>`).catch(function(e){})
    })
    bot.hears(new RegExp(/\/cat\ssafe:\/\/(.*)/s), ctx => {
        console.log("CAT RUN")
        catCommand(ctx,state)
    })

    //Dog folders/files on the baby-fleming local network
    bot.hears('/dog', ctx => {
        ctx.replyWithHTML(`Try <code>/dog [safe://someurl]</code>, `+
        `\nExample 1: <code>/dog ${state.example1}</code>`+
        `\nExample 2: <code>/dog ${state.example2}</code>`).catch(function(e){})
    })
    bot.hears(new RegExp(/\/dog\ssafe:\/\/(.*)/s), ctx => {
        console.log("DOG RUN")
        dogCommand(ctx,state)
    })

    bot.launch()
}

Main()

