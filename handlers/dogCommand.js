const { exec } = require('child_process');

module.exports = async function dogCommand(ctx) {
    //filter for exact NRS format
    const param = ctx.update.message.text.split(" ")[1]
    console.log("DOG RUN")

    exec(`safe dog ${param} --json`, (error, stdout, stderr) => {
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
        console.log(`stdout: ${stdout}`);

        const url = JSON.parse(stdout)[0]
        const data = JSON.parse(stdout)[1][0]

        const keyType = Object.keys(data)[0]
        console.log(keyType)

        if(keyType === 'FilesContainer') {
            const filesContainer = data["FilesContainer"]
            console.log(url, filesContainer)

            ctx.replyWithHTML(
                `<b>+= Files Container =+</b>`+
                `\n<b>XOR-URL:</b> <code>${filesContainer["xorurl"]}</code>`+
                `\n<b>Version:</b> <code>${filesContainer["version"]}</code>`+
                `\n<b>Type Tag:</b> <code>${filesContainer["type_tag"]}</code>`+
                `\n<b>Native Data Type:</b> <code>${filesContainer["data_type"]}</code>`+
                `\n<b>Native data XOR-URL:</b> <code>${filesContainer["resolved_from"]}</code>`
            ).catch(function(e){})

        } else if (keyType === 'PublicImmutableData') {
            const publicImmutableData = data["PublicImmutableData"]
            console.log(url, publicImmutableData)

            ctx.replyWithHTML(
                `<b>-= File =-</b>`+
                `\n<b>XOR-URL:</b> <code>${publicImmutableData["xorurl"]}</code>`+
                `\n<b>Data:</b> <code>${JSON.stringify(publicImmutableData["data"],null,1)}</code>`+
                `\n<b>Media Type:</b> <code>${publicImmutableData["media_type"]}</code>`+
                `\n<b>Metadata:</b> <code>${publicImmutableData["metadata"]}</code>`+
                `\n<b>Resolved From:</b> <code>${publicImmutableData["resolved_from"]}</code>`
            ).catch(function(e){})

        } else {
            ctx.reply("No Data for this type!").catch(function(e){})
        }

    });
}
    