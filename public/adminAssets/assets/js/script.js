

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

