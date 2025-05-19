const mongoose = require('mongoose') ;

const userSchema = new mongoose.Schema({
    id : {
        type : Number ,
    },
    name : {
        type : String ,
    },
    email : {
        type : String ,
    },
    position : {
        type : String ,
    }
});


module.exports = mongoose.model('User' , userSchema) ;