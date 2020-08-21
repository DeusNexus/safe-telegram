const User = require('./../api/User');
const { exec } = require('child_process');
const { isNumber } = require('util');

module.exports = async function sendCommand(ctx,state) {
    //USER HAS INIT ACCOUNT?
    const user = await User.findOne({ id: ctx.from.id})

    if(user){
        
        const toSafeURL = ctx.update.message.text.split(" ")[2]
        const amount = +ctx.update.message.text.split(" ")[1]
        const receiver = await User.findOne({ safeurl_wallet: toSafeURL})
        let nickname = ctx.from.first_name
        let nickReceiver = receiver.first_name

        if(ctx.from.username) {
            nickname = '@'+ctx.from.username
        }
        if(receiver.username){
            nickReceiver = '@' + receiver.username
        }

        if(receiver && receiver.id > 0){

            if(!isNumber(amount)) {
                ctx.replyWithHTML('I hope you learned in school what a number is, try again.').catch(function(e){})
                return
            }

            exec(`safe keys transfer --from ${user.sk_wallet} --to ${toSafeURL} ${amount} --json`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    ctx.replyWithHTML(`You don't have that many Safecoins!`).catch(function(e){})
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    ctx.replyWithHTML('The SAFE URL doesnt work!').catch(function(e){})
                    return;
                }

                console.log(`stdout: ${stdout}`);
                
                //Send to Sender
                ctx.replyWithHTML(
                `You just sent <code>${amount}</code> SAFE Coin(s) to the following <i>SAFE URL</i> owned by ${nickReceiver}:`+
                `\n\n<code>${toSafeURL}</code>`+
                `\n\n<b>TX_ID:</b> <code>${stdout}</code>`
                ).catch(function(e){})

                //Send to Receiver
                ctx.telegram.sendMessage(
                    receiver.id, 
                    `You <b>received</b> <code>${amount}</code> SAFE Coin(s) from ${nickname}!`, 
                    {parse_mode: 'HTML'}
                ).catch(function(e){})

            });    

        } else {
            ctx.replyWithHTML('The SAFE URL you try to sent to is not connected to any user!').catch(function(e){})
        }

    } else {
        //USER HAS NOT INIT
        ctx.replyWithHTML(state.initMessage)
        .catch(function(e){})
    }
}