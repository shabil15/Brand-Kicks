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
        $('.cart-item-count').text(response.cartCount);
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
//============================= to remove a wishList Item ==============================================//

function removeWishItem(productId){
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to remove this item from your wishlist?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes'
  }).then((result) => {
    if (result.isConfirmed) {
    console.log(productId);
    $.ajax({
        url:'/removewishitem',
        method:"delete",
        data:{productId},
        success:(response)=>{
            if(response.status=="remove"){
              location.reload()
            }
        }

    })
  }
}
  )

}

//==================================== to remove a cart Item ==================================================//

// function removeCartItem(user,product,qty) {
//   $.ajax({
//     url:'/removecartproduct',
//     method:'delete',
//     data:{user,product,qty},
//     success:(response)=>{
//       if(response.remove===1){
//         location.reload()
//       }
//     }
//   })
// }

function removeCartItem(user, product, qty) {
  // Show a confirmation message with SweetAlert
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to remove this item from your cart?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes'
  }).then((result) => {
    if (result.isConfirmed) {
      // If confirmed, proceed with the removal
      $.ajax({
        url: '/removecartproduct',
        method: 'delete',
        data: { user, product, qty },
        success: (response) => {
          if (response.remove === 1) {
            $("#cartItem-"+product).remove()
            const tableLength = $('.table').length;
            if(tableLength===0){
              location.reload;
            } 
          }
        }
      });
    }
  });
}


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

//================================= apply coupon at checkout ====================================================================//

function couponApply(){
  let code = document.getElementById("couponInput").value
  let discount = document.getElementById("dicountDisplay")
  let discount2 = document.getElementById("dicountDisplay2")
  let total = document.getElementById('totalDisplay')
  let total2 = document.getElementById('totalDisplay2')

  let MessDis = document.getElementById('MessDis')
  let couponInDiv = document.getElementById("couponInDiv")
  let couponShow = document.getElementById("couponShow")
  let appliedCouponInput = document.getElementById("couponApInput")
  let couponPass = document.getElementById("couponPass")
  let validMessage = document.getElementById('CouponValidMessage')
  let couponInvalidMess = document.getElementById("couponInvalidMess")


  // alert(couponInput)
  $.ajax({
      url:'/checkout/placeorder/coupon',
      method:'post',
      data:{code},
      success:(response)=>{
          if(!response.valid){
              validMessage.innerHTML=response.message
              couponInvalidMess.classList.remove("couponHide")
              setTimeout(() => {
                  couponInvalidMess.classList.add("couponHide")
              }, 5000);
              

          }else{
              console.log(response.redeem);
              discount.innerHTML=response.redeem.discount
              total.innerHTML = response.redeem.total
              discount2.innerHTML=response.redeem.discount
              total2.innerHTML = response.redeem.total
              MessDis.innerHTML =response.redeem.discount
              couponInDiv.classList.add("couponHide")
              couponShow.classList.remove("couponHide")
              appliedCouponInput.value=response.redeem.code
              couponPass.value = response.redeem._id
          }
      }
  })
}