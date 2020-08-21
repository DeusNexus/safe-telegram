const User = require('./../api/User');
const { exec } = require('child_process');

module.exports = async function balanceCommand(ctx,state) {
    const user = await User.findOne({ id: ctx.from.id})

    //USER HAS INIT
    if(user) {
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
        ctx.replyWithHTML(state.initMessage).catch(function(e){})
    }

}