
  $(document).ready(function() {
    $(".imageInput").change(function() {
      var input = this;
      var imagePreview = $(input).siblings('.rounded-image-preview').children('img')[0];

      if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function(e) {
          imagePreview.src = e.target.result;
          $(imagePreview).show();
        };

        reader.readAsDataURL(input.files[0]);
      }
    });
  });


  

  // var removeButton = document.getElementById("removeButton1"); // Get the remove button
  // var originalSrc = "/products/images/<%= product.images.image1 %>"; // Store the original image source
  
  // // Function to update the image preview and enable/disable the remove button
  // function updateImagePreview(inputElement, originalSrc) {
  //   var imagePreview = document.getElementById("imagePreview1");
  //   var file = inputElement.files[0];
  
  //   if (file) {
  //     var reader = new FileReader();
  
  //     reader.onload = function (e) {
  //       imagePreview.src = e.target.result;
  //       // removeButton.disabled = false; // Enable the remove button when a file is selected
  //       removeButton.style.display='none'
  //     };
  
  //     reader.readAsDataURL(file);
  //   } else {
  //     imagePreview.src = originalSrc; // Restore the original image
  //     removeButton.style.display='block'
  //     // removeButton.disabled = true; // Disable the remove button when no file is selected
  //   }
  // }
  
  // // i want to pass the img value 
  // // Function to clear the image preview
  // function removeImagePreview(imagePreviewId,alreadyImg) {
  //   // console.log(alreadyImg);
  //   var imagePreview = document.getElementById(imagePreviewId);
  //   imagePreview.src = alreadyImg; // Restore the original image
  //   removeButton.disabled = true; // Disable the remove button
  // }


// Function to update the image preview and enable/disable the remove button
// Function to update the image preview and enable/disable the remove button
// function updateImagePreview(inputElement,alreadyImg) {
//   var imagePreview = document.getElementById("imagePreview1");
//   var file = inputElement.files[0];
//   var removeButton = document.getElementById("removeButton1");

//   if (file) {
//     var reader = new FileReader();

//     reader.onload = function (e) {
//       imagePreview.src = e.target.result;
//       removeButton.style.display = 'block'; // Show the remove button when a file is selected
//     };

//     reader.readAsDataURL(file);
//   } else {
//     // Restore the original image source when no file is selected
//     imagePreview.src = alreadyImg;
//     removeButton.style.display = 'none'; // Hide the remove button when no file is selected
//   }
// }

// // Function to clear the image preview
// function removeImagePreview(imagePreviewId,alreadyImg) {
//   var imagePreview = document.getElementById(imagePreviewId);
//   // Restore the original image source when the image is removed
//   imagePreview.src = alreadyImg;
//   var removeButton = document.getElementById("removeButton1");
//   removeButton.style.display = 'none'; // Hide the remove button
// }



// working in one image 
// =======================
// function updateImagePreview(inputElement, imagePreviewId, alreadyImg, removeButtonId) {
//   var imagePreview = document.getElementById(imagePreviewId);
//   var file = inputElement.files[0];
//   var removeButton = document.getElementById(removeButtonId);

//   if (file) {
//     var reader = new FileReader();

//     reader.onload = function (e) {
//       imagePreview.src = e.target.result;
//       removeButton.style.display = 'block'; // Show the remove button when a file is selected
//     };

//     reader.readAsDataURL(file);
//   } else {
//     // Restore the original image source when no file is selected
//     imagePreview.src = alreadyImg;
//     removeButton.style.display = 'none'; // Hide the remove button when no file is selected
//   }
// }

// function removeImagePreview(imagePreviewId, alreadyImg, removeButtonId) {
//   var imagePreview = document.getElementById(imagePreviewId);
//   // Restore the original image source when the image is removed
//   imagePreview.src = alreadyImg;
//   var removeButton = document.getElementById(removeButtonId);
//   removeButton.style.display = 'none'; // Hide the remove button
// }





function updateImagePreview(inputElement, imagePreviewId, alreadyImg, removeButtonId) {
  var imagePreview = document.getElementById(imagePreviewId);
  var file = inputElement.files[0];
  var removeButton = document.getElementById(removeButtonId);

  if (file) {
    var reader = new FileReader();

    reader.onload = function (e) {
      imagePreview.src = e.target.result;
      removeButton.style.display = 'block'; // Show the remove button when a file is selected
    };

    reader.readAsDataURL(file);
  } else {
    // Restore the original image source when no file is selected
    imagePreview.src = alreadyImg;
    removeButton.style.display = 'none'; // Hide the remove button when no file is selected
  }
}

function removeImagePreview(imagePreviewId, alreadyImg, removeButtonId) {
  var imagePreview = document.getElementById(imagePreviewId);
  // Restore the original image source when the image is removed
  imagePreview.src = alreadyImg;
  var removeButton = document.getElementById(removeButtonId);
  removeButton.style.display = 'none'; // Hide the remove button
}

