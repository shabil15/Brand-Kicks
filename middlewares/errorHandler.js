const errorHandler = (err,req,res,next) => {
  console.log("err:",err.name);

  const errStatus = err.statusCode || 500;
  console.log("errStatus:",errStatus);

  if(err.name === 'CastError' || err.name === 'MulterError') {
    console.log(err);

    res.status(404).render('404');
  } else {
    console.log(err);

    res.status(500).render('500')
  }
};

module.exports = errorHandler;