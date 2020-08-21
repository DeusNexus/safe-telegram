const mongoose = require('mongoose');
module.exports = async function() {
    return await mongoose.connect(
        process.env.DB_URI, 
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then( () => console.log("Connected to DB!") )
        .catch(e => console.error(e) 
    )
}
