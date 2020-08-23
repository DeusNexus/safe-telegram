const { Extra  } = require('telegraf');
const { exec } = require('child_process');
const initUser = require('./../functions/initUser')
const User = require('./../api/User');

module.exports = async function initCommand(ctx) {

    // const res = await User.findOne({ id: ctx.from.id })

    // //USER IN DB?
    // if(!res) {        
        exec(`safe keys create --test-coins --preload 500 --json`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            // console.log(`stdout: ${stdout}`);
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
            ).catch(function(e){
                ctx.replyWithHTML(
                    `You <b>successfully</b> initialized your personal <b>SAFE Wallet</b>!`+
                    `\nYour <b>secret data</b>; SAFE URL, Public Key and Secret Key are stored under the command /secret!`+
                    `\n\nThe address is preloaded with 500 SAFE coins to experiment with, you can add more using the command <code>/addcoins [amount]</code>.`+
                    `\n\nFor more details on how to use this bot view <code>/help</code>.`+
                    `\n\n*The Chat Your Are in Doesn't Allow Images so the banner is left out!*`
                ).catch(function(e){})
            })

        });

    // } else {
    //     //USER ALREADY INIT
    //     ctx.replyWithPhoto(
    //         { source: 'init.png' }, 
    //         Extra.caption('Your SAFE wallet is already initialized, you can only do this once!')
    //     .HTML())
    //     .catch(function(e){})
    // }
    
}