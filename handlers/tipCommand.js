const User = require('./../api/User');
const { exec } = require('child_process');
const { isNumber } = require('util');

module.exports = async function tipCommand(ctx,state) {
    //SEND IN REPLY?
    const isReply = ctx.message.reply_to_message ? true : false

    //USER HAS ACCOUNT?
    const res_sender = await User.findOne({ id: ctx.from.id})

    if(isReply && res_sender) {

        //GET CHAT MEMBER REPLY
        const { id } = ctx.message.reply_to_message.from
        const res_receiver = await User.findOne({ id: id})
        let nicknameReceiver = ctx.message.reply_to_message.from.first_name
        let nicknameSender = ctx.from.first_name
        if(ctx.message.reply_to_message.from.username) {
            nicknameReceiver = '@'+ctx.message.reply_to_message.from.username
        }
        if(ctx.from.username) {
            nicknameSender = '@'+ctx.from.username
        }
        const amount = +ctx.update.message.text.split(" ")[1]
        const sender = res_sender

        //RECEIVER TG ID IN DATABASE WITH SAFE ADDRESS?
        if(res_receiver) {
            const receiver = res_receiver
            //FIND USER ID, CHECK IF IN USERIDS (ALREADY DONE), IF SO SEARCH SAFEURL
            if(!isNumber(amount)) {
                ctx.replyWithHTML('I hope you learned in school what a number is, try again.')
                return
            }
                exec(`safe keys transfer --from ${sender.sk_wallet} --to ${receiver.safeurl_wallet} ${amount} --json`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        ctx.replyWithHTML(`You don't have that many safecoins!`).catch(function(e){})
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        ctx.replyWithHTML('Unable to tip person').catch(function(e){})
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                    const obj = JSON.parse(stdout)
                    ctx.replyWithHTML(
                        `You <b>tipped</b> <i>${nicknameReceiver}</i> a total of <code>${amount}</code> <b>SAFE Coins</b> to their wallet!`
                        ).catch(function(e){})
                    ctx.telegram.sendMessage(
                        id, 
                        `You <b>received</b> <code>${amount}</code> <b>SAFE Coins</b> as a tip from ${nicknameSender}!`, 
                        { parse_mode: 'HTML' }
                        ).catch(function(e){})
                }); 

        } else {
            //USER NOT IN DB
            ctx.replyWithHTML(`The person you try to tip (${nicknameReceiver}) has not yet initialized a personal SAFE Wallet on this bot!`)
            .catch(function(e){})
        }

    } else if(!isReply) {
        //NOT REPLY
        ctx.replyWithHTML(`<b>Reply</b> to an user and write <code>/tip [amount]</code>!`)
    } else {
        //NOT INIT
        ctx.replyWithHTML(state.initMessage).catch(function(e){})
    }
}