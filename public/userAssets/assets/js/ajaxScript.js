const { $where } = require("../../../../models/bannerModel");
const { response } = require("../../../../routes/userRoute");

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

        qtyInput.value=newQuantity.newQuantity
        singleProductTotal.innerHTML=`₹${Number(singleProductPrice.innerHTML)*Number(newQuantity.quantity)}`
      }
    })
  }
}

function removeCartItem(user,product,qty) {
  $.ajax({
    url:'/removecartproduct',
    method:'delete',
    data:{user,product,qty},
    success:(response)=>{
      if(response.remove===1){
        location.reload()
      }
    }
  })
}

// function removeCartItem(user, product, qty) {
//   fetch('/removecartproduct', {
//     method: 'DELETE',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ user, product, qty }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       if (data.remove === 1) {
//         // Find the cart table by ID
//         const cartTable = document.getElementById('cartContainer');
//         if (cartTable) {
//           // Find and remove the row of the removed item
//           const rowToRemove = document.querySelector(`[data-product="${product}"]`);
//           if (rowToRemove) {
//             cartTable.removeChild(rowToRemove);
//           }
//         }
//       }
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//     });
// }
