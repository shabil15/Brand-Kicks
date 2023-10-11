const isLogin= async (req,res,next)=>{
  try {
    if(req.session.user_id){}
    else{
      res.redirect('/login')
    }
    next()
  } catch (error) {
    console.log(error);
    next(error);
  }
}

const isLogout = async (req,res,next)=>{
  try {
    if(req.session.user_id){
      res.redirect('/')
    }
  } catch (error) {
    console.log(error);
  }
}


module.exports = {
  isLogin,
  isLogout 
}