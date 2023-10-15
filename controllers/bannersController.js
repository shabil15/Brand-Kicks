

const bannersLoad= async(req,res) => {
  try {
    res.render('banners')
  } catch (error) {
    console.log(error);
  }
}


module.exports={
  bannersLoad
}
