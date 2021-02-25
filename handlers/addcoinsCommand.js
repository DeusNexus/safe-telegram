const User = require('./../api/User');
const { exec } = require('child_process');
const { isNumber } = require('util');

module.exports = async function addcoinsCommand(ctx,state) {
    //USER HAS INIT
    const user = await User.findOne({ id: ctx.from.id})
    if(user) {
        const mySafeURL = user.safeurl_wallet
        const amount = +ctx.update.message.text.split(" ")[1]

        if(parseInt(amount) > state.maxCoins) {
            ctx.replyWithHTML('Exceeding maximum top-up! Try to be less greedy.').catch(function(e){})
            return
        }

        if(!typeof(amount)==='number') {
            ctx.replyWithHTML('I hope you learned in school what a number is, try again.')
            return
        }

        //EXEC 1
        try {
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
            // console.log(`stdout: ${stdout}`);

            const response = JSON.parse(stdout)
            console.log(response)

            //EXEC 2
            exec(`safe wallet transfer --from ${response[0]} --to ${mySafeURL} ${amount} --json`, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                // console.log(`stdout: ${stdout}`);

                ctx.replyWithHTML(
                    `You added <code>${amount}</code> <b>SAFE Coins</b> to your wallet! \n<b>TX_ID:</b><code> ${stdout}</code>`
                ).catch(function(e){})
            })
            //EXEC 2 END

        });
    
        } catch(e) {
            console.log(e)
        }
        //EXEC 1 END
        
    } else {
        //NO INIT
        ctx.replyWithHTML(state.initMessage).catch(function(e){})
    }
}