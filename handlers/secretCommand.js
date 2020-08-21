const User = require('./../api/User');
const { Extra  } = require('telegraf');

module.exports = async function secretCommand(ctx,state) {
    const user = await User.findOne({ id: ctx.from.id})
    
    if(user) {

        console.log("USER:",user)

        text =  (`<b>These are the details for your personal SAFE Wallet, keep them SAFE!</b>`+
        `\n\n<b>Your SAFE Wallet URL:</b>`+
        `\n<code>${user.safeurl_wallet}</code>`+
        `\n\n<b>Public Key:</b> \n<code>${user.pk_wallet}</code>`+
        `\n\n<b>Secret Key:</b> \n<code>${user.sk_wallet}</code>`+
        `\n\n<i>This is running on a local baby-flemming test network, future version will connect to shared-section, `+
        `you can still send you coins to other users using this bot.</i>`)

        ctx.replyWithPhoto(
            {source: 'safe.jpg'}, 
            Extra.caption(text)
            .HTML())
            .catch(function(e){}
        )

    } else {

        console.log("USER:",user)
        
        ctx.replyWithHTML(state.initMessage)
        .catch(function(e){})

    }
}