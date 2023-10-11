

function blockButton(id) {
    // Send an AJAX request to update the user's block status
    $.ajax({
        url: '/admin/blockUser',
        method: "post",
        data: { id: id },
        success: function (response) {
            let users = response.users;
            let targetUser = users.find((user) => {
                return user._id === id;
            });

            // Update the button class and text based on the user's block status
            if (targetUser.isBlock==false) {
                $(`button[data-id="${id}"]`).removeClass('btn-inverse-danger').addClass('btn-inverse-success').text('block');
            } else {
                $(`button[data-id="${id}"]`).removeClass('btn-inverse-success').addClass('btn-inverse-danger').text('unBlock');
            }
        },
        error: function (error) {
            console.error("Error:", error);
        }
    });
}


// function blockCategory(id) {
//     console.log("clicked....");
//     $.ajax({
//         url: '/admin/category/block',
//         method: "post",
//         data: { id: id },
//         success: function (response) {
//             let categories = response.categories;
//             let targetCategory = categories.find((cate) => {
//                 return cate._id === id;
//             });

//             // Update the button class and text based on the user's block status
//             if (targetCategory.block == 0) {
//                 $(`button[data-id="${id}"]`).removeClass('btn-inverse-warning').addClass('btn-inverse-success').text('block');
//             } else {
//                 $(`button[data-id="${id}"]`).removeClass('btn-inverse-success').addClass('btn-inverse-warning').text('unBlock');
//             }
//         },
//         error: function (error) {
//             console.error("Error:", error);
//         }
//     });
// }
