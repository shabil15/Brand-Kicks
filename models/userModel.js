const mongoose = require('mongoose');

// const { Schema, ObjectId } = mongoose;

const UserSchema = new mongoose.Schema({
 
  firstName: {
     type: String,
     required: true 
    },
  secondName: { 
    type: String,
    required:true 
    },
  email: { 
    type: String, 
    required: true 
  }, 
  mobile:{
     type: String, 
     required: true 
    },
  password: { 
    type: String, 
    required: true 
  },
  isVerified: {
    type: Boolean,
    default: 0
},
isBlock:{
    type: Boolean,
    default: false
},
},
{
  timestamps:true
}
);

module.exports = mongoose.model('User', UserSchema);

// export default Users;

