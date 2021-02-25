const { exec } = require('child_process');

module.exports = async function catCommand(ctx,state) {
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

        console.log(`stdout (${typeof(stdout)}): ${stdout}`);

        try {
            if(Array.isArray(JSON.parse(stdout))) {
                console.log('IsArray...')
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
                ).catch(function(e){console.log(e)})
            } else {
                ctx.replyWithMarkdown(`***[File Content]***: \n${'`'+stdout+'`'}`).catch(function(e){console.log(e)})
            }
        } catch(e) {
            ctx.replyWithMarkdown(`***[File Content]***: \n${'`'+stdout+'`'}`).catch(function(e){console.log(e)})
        }

    });
    
}