require('dotenv').config();
const { Telegraf, Extra  } = require('telegraf');
const { exec } = require('child_process');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//Connect to DB
async function Main() {
    await mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      .then( () => console.log("Connected to DB!") )
      .catch(e => console.error(e) )

    //Mongoose Model
    const Schema = mongoose.Schema;
    const userSchema = new Schema({
        first_name: String,
        username: { type:String, default:''},
        id: Number,
        is_bot: Boolean,
        language_code: String,
        type: String,
        safeurl_wallet: String,
        pk_wallet: String,
        sk_wallet: String,
        date: { type: Date, default: Date.now }
    });
    const User = mongoose.model('ModelName', userSchema);

    //Create Bot Instance
    const bot = await new Telegraf(process.env.BOT_TOKEN, {
        username: 'SafeNetworkWallet_bot',
        channelMode: false
    })

    function initUser(ctx, safeurl, pk, sk) {
        const { id, first_name, is_bot, language_code } = ctx.update.message.from
        const { type } = ctx.update.message.chat
        let username = ""
        if(ctx.update.message.from.username) {
            username = ctx.update.message.from.username
        }
        const uObj = {
            "first_name": first_name,
            "username": username,
            "id": id,
            "is_bot": is_bot,
            "language_code": language_code,
            "type": type,
            "safeurl_wallet": safeurl,
            "pk_wallet": pk,
            "sk_wallet": sk
        }

        User.create(uObj, (res, err) => {
            if(err) {
                console.error(err)
            } else if (res) {
                console.log("User Created")

            }
        })
    }

    const initMessage = "To start using this bot, please do /init first!"

    bot.start((ctx) => ctx.reply('Welcome to the Safenetwork Wallet Bot!'))

    bot.command('help', ctx => {
        ctx.replyWithHTML('Help Instructions...')
    })

    bot.hears(new RegExp(/\/init/s), async ctx => {
        console.log("INIT RUN")
        const res = await User.findOne({ id: ctx.from.id })
        console.log("DB RES:",res)
        //USER IN DB?
        if(!res) {
            exec(`safe keys create --test-coins --preload 500 --json`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                const obj = JSON.parse(stdout)
                const safeurl = obj[0]
                const pk = obj[1].pk
                const sk = obj[1].sk
                initUser(ctx,safeurl, pk, sk)
                ctx.replyWithPhoto({ source: 'init.png' }, Extra.caption(
                    `You <b>successfully</b> initialized your personal <b>SAFE Wallet</b>!`+
                    `\nYour <b>secret data</b>; SAFE URL, Public Key and Secret Key are stored under the command /secret!`+
                    `\n\nThe address is preloaded with 500 SAFE coins to experiment with, you can add more using the command <code>/addcoins [amount]</code>.`+
                    `\n\nFor more details on how to use this bot view <code>/help</code>.`).HTML()
                ).catch(function(e){})
            });
        } else {
            //USER ALREADY INIT
            ctx.replyWithPhoto({ source: 'init.png' }, Extra.caption('Your SAFE wallet is already initialized, you can only do this once!').HTML()).catch(function(e){})
        }
    })

    bot.hears(new RegExp(/\/secret/s), async ctx => {
        const res = await User.findOne({ id: ctx.from.id})
        if(res) {
            const user = res
            console.log("USER:",user)
            text =  (`<b>These are the details for your personal SAFE Wallet, keep them SAFE!</b>`+
            `\n\n<b>Your SAFE Wallet URL:</b>`+
            `\n<code>${user.safeurl_wallet}</code>`+
            `\n\n<b>Public Key:</b> \n<code>${user.pk_wallet}</code>`+
            `\n\n<b>Secret Key:</b> \n<code>${user.sk_wallet}</code>`+
            `\n\n<i>This is running on a local baby-flemming test network, future version will connect to shared-section, `+
            `you can still send you coins to other users using this bot.</i>`)
            ctx.replyWithPhoto({source: 'safe.jpg'}, Extra.caption(text).HTML()).catch(function(e){})
        } else {
            console.log("USER:",res)
            ctx.replyWithHTML(initMessage).catch(function(e){})
        }
    })

    bot.hears(new RegExp(/\/balance/s), async (ctx) => {
        console.log("BALANCE RUN")
        const res = await User.findOne({ id: ctx.from.id})
        //USER HAS INIT
        if(res) {
            const user = res
            exec(`safe keys balance --sk ${user.sk_wallet} --json`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    ctx.replyWithHTML(
                        `Unable to check balance!`
                    ).catch(function(e){})
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    ctx.replyWithHTML(
                        `Unable to check balance!`
                    ).catch(function(e){})
                    return;
                }
                console.log(`stdout: ${stdout}`);
                // const obj = JSON.parse(stdout)
                ctx.replyWithHTML(
                `Your SAFE Wallet balance is: \n<code>${stdout}</code>`
                ).catch(function(e){})
            });
        } else {
            //NO INIT
            ctx.replyWithHTML(initMessage).catch(function(e){})
        }
    })

    bot.hears('/addcoins', ctx => {
        ctx.replyWithHTML(`Try <code>/addcoins [amount]</code>, \nExample: <code>/addcoins 99</code>`).catch(function(e){})
    })
    bot.hears(new RegExp(/\/addcoins\s(\d{1,30})/s), async (ctx) => {
        console.log("ADDCOINS RUN")
        //USER HAS INIT
        const res = await User.findOne({ id: ctx.from.id})
        if(res) {
            const user = res
            const mySafeURL = user.safeurl_wallet
            const amount = ctx.update.message.text.split(" ")[1]
            exec(`safe wallet create --preload ${amount+1} --test-coins --json`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    ctx.replyWithHTML(
                        `Unable to add coins!`
                    ).catch(function(e){})
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    ctx.replyWithHTML(
                        `Unable to add coins!`
                    ).catch(function(e){})
                    return;
                }
                console.log(`stdout: ${stdout}`);
                const response = JSON.parse(stdout)
                console.log(response)
                exec(`safe wallet transfer --from ${response[0]} --to ${mySafeURL} ${amount} --json`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);

                    ctx.replyWithHTML(
                        `You added <code>${amount}</code> <b>SAFE Coins</b> to your wallet! \n<b>TX_ID:</b><code> ${stdout}</code>`
                    ).catch(function(e){})
                })
            });
        } else {
            //NO INIT
            ctx.replyWithHTML(initMessage).catch(function(e){})
        }
    })

    bot.hears('/send', ctx => {
        ctx.replyWithHTML(`Try <code>/send [amount] [Receive SAFE URL]</code>, \nExample: <code>/send 25 safe://hbyyyybkyosnrn1ir1fqcxks9r16xe83dgjimxdo6p18wugfqff9yy6p3w</code>`).catch(function(e){})
    })
    bot.hears(new RegExp(/\/send\s(\d{1,30})\s(safe:\/\/.*)/s), async (ctx) => {
        console.log("SEND RUN")
        //USER HAS INIT ACCOUNT?
        const res = await User.findOne({ id: ctx.from.id})
        if(res){
            const toSafeURL = ctx.update.message.text.split(" ")[2] //"safe://hbyyyybnyxpfwt6k66kdsbmat8rp4o5qkhxcyoko1bxrhw4bocdkbe9k5w"
            const amount = ctx.update.message.text.split(" ")[1]
            const user = res
            const receiver = await User.findOne({ safeurl_wallet: toSafeURL})
            let nickname = ctx.from.first_name
            if(ctx.from.username) {
                nickname = '@'+ctx.from.username
            }
            if(receiver.id > 0){
                exec(`safe keys transfer --from ${user.sk_wallet} --to ${toSafeURL} ${amount} --json`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        ctx.replyWithHTML('The SAFE URL doesnt work!').catch(function(e){})
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        ctx.replyWithHTML('The SAFE URL doesnt work!').catch(function(e){})
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                    ctx.replyWithHTML(
                    `You just sent <code>${amount}</code> SAFE Coin(s) to the following <i>Safe-URL</i>:`+
                    `\n\n<code>${toSafeURL}</code>`+
                    `\n\n<b>TX_ID:</b> <code>${stdout}</code>`
                    ).catch(function(e){})
                    //RECEIVER ID
                    ctx.telegram.sendMessage(receiver.id, `You <b>received</b> <code>${amount}</code> SAFE Coin(s) from ${nickname}!`, {parse_mode: 'HTML'}).catch(function(e){})
                });    
            } else {
                ctx.replyWithHTML('The SAFE URL you try to sent to is not connected to any user!').catch(function(e){})
            }
        } else {
            //USER HAS NOT INIT
            ctx.replyWithHTML(initMessage).catch(function(e){})
        }
    })

    bot.hears('/tip', ctx => {
        ctx.replyWithHTML(`Try <code>/tip [amount]</code> while replying to someones message, \n<i>this user already needs to have a SAFE Wallet</i> , e.g. <code>/tip 20</code>`).catch(function(e){})
    })
    bot.hears(new RegExp(/\/tip\s(\d{1,30})/s), async (ctx) => {
        console.log("TIP RUN")
        //USER HAS ACCOUNT?
        const res_sender = await User.findOne({ id: ctx.from.id})
        if(res_sender) {
            //GET CHAT MEMBER REPLY
            const { id } = ctx.message.reply_to_message.from
            const res_receiver = await User.findOne({ id: id})
            let nicknameReceiver = ctx.message.reply_to_message.from.first_name
            let nicknameSender = ctx.from.first_name
            if(ctx.message.reply_to_message.from.username) {
                nickname = '@'+ctx.message.reply_to_message.from.username
            }
            if(ctx.from.username) {
                nicknameSender = '@'+ctx.from.username
            }
            const amount = ctx.update.message.text.split(" ")[1]
            const sender = res_sender
            console.log(id, nickname, amount)
            //RECEIVER TG ID IN DATABASE WITH SAFE ADDRESS?
            if(res_receiver) {
                const receiver = res_receiver
                //FIND USER ID, CHECK IF IN USERIDS (ALREADY DONE), IF SO SEARCH SAFEURL
                exec(`safe keys transfer --from ${sender.sk_wallet} --to ${receiver.safeurl_wallet} ${amount} --json`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        ctx.replyWithHTML('Unable to tip person').catch(function(e){})
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        ctx.replyWithHTML('Unable to tip person').catch(function(e){})
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                    // const obj = JSON.parse(stdout)
                    ctx.replyWithHTML(`You <b>tipped</b> <i>${nicknameReceiver}</i> a total of <code>${amount}</code> <b>SAFE Coins</b> to his/her wallet!`).catch(function(e){})
                    ctx.telegram.sendMessage(id, `You <b>received</b> <code>${amount}</code> <b>SAFE Coins</b> as a tip from ${nicknameSender}!`, {parse_mode: 'HTML'}).catch(function(e){})
                });            
            } else {
                //NOT IN DB
                ctx.replyWithHTML(`The person you try to tip (${nickname}) has not yet initialized a personal SAFE Wallet on this bot!`).catch(function(e){})
            }
        } else {
            //NOT INIT
            ctx.replyWithHTML(initMessage).catch(function(e){})
        }
    })

    bot.hears(new RegExp(/\/keypair/s), async (ctx) => {
        console.log("KEYPAIR RUN")
        exec(`safe keypair --json`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                ctx.replyWithHTML(
                    `Unable to create keypair!`
                ).catch(function(e){})
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                ctx.replyWithHTML(
                    `Unable to create keypair!`
                ).catch(function(e){})
                return;
            }
            console.log(`stdout: ${stdout}`);
            const obj = stdout.split(" ")
            ctx.replyWithHTML(
            `<b>Key Pair Generated!</b>`+
            `\n\n<b>Public Key:</b> `+
            `\n<code>${obj[3]}</code>`+
            `\n\n<b>Secret Key:</b> `+
            `\n<code>${obj[6]}</code>`
            ).catch(function(e){})
        });
    })

    bot.hears('/cat', ctx => {
        ctx.replyWithHTML(`Try <code>/cat [safe://someurl]</code>, `+
        `\nExample 1: <code>/cat safe://hnyynype8maxgk58gic4iz5c8ebbksoukpeztpz1g7jxxm9t3wkfsrouegbnc</code>`+
        `\nExample 2: <code>/cat safe://hbhydyds3dsm1ozpnzc5i6n6iesye838yo1qt4753euwh4drzwz57btn8k</code>`).catch(function(e){})
    })
    bot.hears(new RegExp(/\/cat\ssafe:\/\/(.*)/s), ctx => {
        //filter for exact NRS format
        const param = ctx.update.message.text.split(" ")[1]
        console.log("CAT RUN")

        exec(`safe cat ${param} --json`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                ctx.replyWithHTML(
                    `No Content Found at <code>${param}</code>!`
                ).catch(function(e){})
                return;
            }
            if (stderr) {
                console.lYog(`stderr: ${stderr}`);
                ctx.replyWithHTML(
                    `Error!`
                ).catch(function(e){})
                return;
            }

            console.log(`stdout: ${stdout}`);

            try {
                if(Array.isArray(JSON.parse(stdout))) {
                    const url = JSON.parse(stdout)[0]
                    const data = JSON.parse(stdout)[1]
                    const key = Object.keys(data)
                    const values = data[key]
            
                    ctx.replyWithHTML(
                        `<b>Files</b> of <b>FilesContainer</b> at <code>${url}</code>\n`+
                        `\n<b>Name:</b> <code>${key}</code>`+
                        `\n<b>Type:</b> <code>${values["type"]}</code>`+
                        `\n<b>Size:</b> <code>${values["size"]}</code>`+
                        `\n<b>isModified:</b> <code>${values["o_created"]===values["modified"]?'Yes':'No'}</code>`+
                        `\n<b>File Link:</b> <code>${values["link"]}</code>`
                    ).catch(function(e){})
                } else {
                    ctx.replyWithHTML(`<b>[File Content]:</b> <code>${stdout}</code>`).catch(function(e){})
                }
            } catch(e) {
                ctx.replyWithHTML(`<b>[File Content]:</b> <code>${stdout}</code>`).catch(function(e){})
            }
        });

    })

    bot.hears('/dog', ctx => {
        ctx.replyWithHTML(`Try <code>/dog [safe://someurl]</code>, `+
        `\nExample 1: <code>/dog safe://hnyynype8maxgk58gic4iz5c8ebbksoukpeztpz1g7jxxm9t3wkfsrouegbnc</code>`+
        `\nExample 2: <code>/dog safe://hbhydyds3dsm1ozpnzc5i6n6iesye838yo1qt4753euwh4drzwz57btn8k</code>`).catch(function(e){})
    })
    bot.hears(new RegExp(/\/dog\ssafe:\/\/(.*)/s), ctx => {
        //filter for exact NRS format
        const param = ctx.update.message.text.split(" ")[1]
        console.log("DOG RUN")

        exec(`safe dog ${param} --json`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                ctx.replyWithHTML(
                    `No Content Found at <code>${param}</code>!`
                ).catch(function(e){})
                return;
            }
            if (stderr) {
                console.lYog(`stderr: ${stderr}`);
                ctx.replyWithHTML(
                    `Error!`
                ).catch(function(e){})
                return;
            }
            console.log(`stdout: ${stdout}`);

            const url = JSON.parse(stdout)[0]
            const data = JSON.parse(stdout)[1][0]

            const keyType = Object.keys(data)[0]
            console.log(keyType)

            if(keyType === 'FilesContainer') {
                const filesContainer = data["FilesContainer"]
                console.log(url, filesContainer)

                ctx.replyWithHTML(
                    `<b>+= Files Container =+</b>`+
                    `\n<b>XOR-URL:</b> <code>${filesContainer["xorurl"]}</code>`+
                    `\n<b>Version:</b> <code>${filesContainer["version"]}</code>`+
                    `\n<b>Type Tag:</b> <code>${filesContainer["type_tag"]}</code>`+
                    `\n<b>Native Data Type:</b> <code>${filesContainer["data_type"]}</code>`+
                    `\n<b>Native data XOR-URL:</b> <code>${filesContainer["resolved_from"]}</code>`
                ).catch(function(e){})

            } else if (keyType === 'PublicImmutableData') {
                const publicImmutableData = data["PublicImmutableData"]
                console.log(url, publicImmutableData)

                ctx.replyWithHTML(
                    `<b>-= File =-</b>`+
                    `\n<b>XOR-URL:</b> <code>${publicImmutableData["xorurl"]}</code>`+
                    `\n<b>Data:</b> <code>${JSON.stringify(publicImmutableData["data"],null,1)}</code>`+
                    `\n<b>Media Type:</b> <code>${publicImmutableData["media_type"]}</code>`+
                    `\n<b>Metadata:</b> <code>${publicImmutableData["metadata"]}</code>`+
                    `\n<b>Resolved From:</b> <code>${publicImmutableData["resolved_from"]}</code>`
                ).catch(function(e){})

            } else {
                ctx.reply("No Data for this type!").catch(function(e){})
            }

        });

    })

    bot.launch()
}

Main()

