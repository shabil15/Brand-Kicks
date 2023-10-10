const admin= require('../models/adminModel')
const bcrypt= require('bcrypt')
const session = require("express-session");


const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const loadAdminLogin = async (req, res) => {
  try {
    res.render("adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};


// const verifyLogin= async (req,res)=>{
//   try {
//     const email= req.body.email;
//     const password= req.body.password;
//     const adminData = await adminDb.findOne({email:email});
//     if(adminData && adminData.email===email){
//       if(password==adminData.password){
        
//       }
//     }
//   } catch (error) {
//     console.log(error);    
//   }
// }

const verifyLogin = async (req, res,next) => {
  try {
      const email = req.body.email
      const Password = req.body.password
      console.log(Password);

      const adminData = await admin.findOne({ email:email})
      console.log(adminData);
      if (adminData) {

              const passwordMatch = await bcrypt.compare(Password, adminData.password)

              if (passwordMatch) {
                      res.render('dashboard')
              }
              else {
                  res.render('login', { message: "Email and  password is incorrect" })
              }


      }
      else {
          res.render('login', { message: "Email and  password is incorrect" })

      }
  }
  catch (err) {

      next(err)
  }
}


const dashboardLoad= async (req,res)=>{
  try {
    res.render('dashboard')
  } catch (error) {
    log(error)
  }
}

module.exports={
  loadAdminLogin,
  verifyLogin,
  dashboardLoad
}