const User = require('./../api/User');

module.exports = function initUser(ctx, safeurl, pk, sk) {
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