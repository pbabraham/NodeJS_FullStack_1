const mongoose = require ('mongoose');
mongoose.Promise = global.Promise;

//mongoose.set("debug", true);

let connect =()=>{
    return new Promise((resolve, reject) => {
        mongoose.connect(process.env.mongoUrl, { useNewUrlParser: true , useUnifiedTopology: true , useFindAndModify : false}, function(err) {
              if (err) {
                return reject( {
                        message: `Connection erorr to MongoDB at ${process.env.mongoUrl}` +err
                    }
                )
            } else {
                console.log('Successfully mealplan connected mongodb...');
                resolve(`Mongo connected at ${process.env.mongoUrl}`);
            }
        });
    });

}

module.exports = {
    connect
}
