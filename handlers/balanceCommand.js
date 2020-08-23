const User = require('./../api/User');
const { exec } = require('child_process');

module.exports = async function balanceCommand(ctx,state) {
    const user = await User.findOne({ id: ctx.from.id})
    //USER HAS INIT
    if(user) {
        console.log("There is a user present in DB!")
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
            const obj = JSON.parse(stdout)
            
            ctx.replyWithHTML(
            `Your SAFE Wallet balance is: \n<code>${stdout}</code>`
            ).catch(function(e){
                console.log(e)
            })
            
        });
    } else {
        //NO INIT
        console.log("[!] There is a no user present in DB!")
        ctx.replyWithHTML(state.initMessage).catch(function(e){})
    }

}