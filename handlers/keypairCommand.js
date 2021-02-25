const { exec } = require('child_process');

module.exports = async function keypairCommand(ctx,state) {
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

        console.log(obj)
        ctx.replyWithHTML(
            `<b>Key Pair Generated!</b>`+
            `\n\n<b>Public Key:</b> `+
            `\n<code>${obj[3].split('\n')[0]}</code>`+
            `\n\n<b>Secret Key:</b> `+
            `\n<code>${obj[6]}</code>`
        ).catch(function(e){})
        
    });
}