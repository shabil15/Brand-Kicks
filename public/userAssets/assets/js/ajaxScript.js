//============== to add cart item ========================================//

function addCart(id,user) {
  function showAlertBox(){
    console.log("added");
    $("#cartAlert").fadeIn();

    //Hide the Alert Box after 3 seconds
    setTimeout(function(){
      $('#cartAlert').fadeOut();
    },3000)

  }

  function showAlertBoxAlready() {
    console.log("added");
    $("#cartAlertAlready").fadeIn()


  //Hide the Alert box Already after 3 seconds

  setTimeout(function(){
    $('#cartAlertAlready').fadeOut()
  },3000)
}


  if(user){
    $.ajax({
      url: '/addtocart',
      method: "post",
      data: {id:id,user:user},
      success: function (response){
        if(response.cart==1){
        showAlertBox()
      }
      if(response.cart==2){
        showAlertBoxAlready()
      }
      },
      error:function(error){
        console.log("Error",error);
      }
      
    });
  }else{
    window.location.href= '/login'
  }

}

//========================== to change the quantity in cart page ==================================//
function changeQty(userId,productId,qty){
  let totalDis = document.getElementById('totalDisplay')
  let subTotalDis = document.getElementById('subtotalDisplay')
  let singleProductTotal= document.getElementById(`singleProductTotal${productId}`)
  let qtyInput = document.getElementById(`qty${productId}`)
  let singleProductPrice = document.getElementById(`singleProductPrice${productId}`)


  if(userId) {
    $.ajax({
      url:'/changeqty',
      method:'post',
      data:{userId,productId,qty:qty},
      success:(response)=>{
        response.total ==undefined ? window.location.href='/login':


        totalDis.innerHTML =response.total
        subTotalDis.innerHTML=response.total

        let newQuantity = response.cartItems.products.find(val=>val.product==productId)

        qtyInput.value=newQuantity.quantity                    
        singleProductTotal.innerHTML=`₹${Number(singleProductPrice.innerHTML)*Number(newQuantity.quantity)}`
      }
    })
  }
}




//========================================== to add item to WishList ===============================================//

function addtoWishList(productId,user){
  function showWishAlertBox() {
    $("#wishAlert").fadeIn();
  

  setTimeout(function(){
    $("#wishAlert").fadeOut();
  },4000)
}

function showWishAlertBoxAlready() {
  $("#wishAlertAlready").fadeIn();

  setTimeout(function(){
    $("#wishAlertAlready").fadeOut();
  },3000)
}


  if(user){
$.ajax({
  url:'/addtoWishList',
  method:'post',
  data:{productId},
  success:(response)=>{
    if(response.status==1){
      showWishAlertBox();
    }else{
      showWishAlertBoxAlready();
    }
  }
})
}else{
  window.location.href= '/login'
}
  
}


//==================================== to remove a cart Item ==================================================//




//==================================== to remove address =======================================================//
function removeAddress(id){
  $.ajax({
    url:'/profile/user_address/delete',
    method:'delete',
    data:{id},
    success:(response)=>{
      if(response.remove==1){
        location.reload()
      }
    }
  })
}
