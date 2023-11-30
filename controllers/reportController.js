const mongoose = require('mongoose');
const Product = require('../models/productsModel').product
const User = require('../models/userModel').User;
const Order = require('../models/orderModel').Order


// ============================loading sales report page =========================================//


const loadSalesReport = async (req, res) => {
  try {
    let start, end;

    if (req.query.start && req.query.end) {
      start = req.query.start;
      end = new Date(req.query.end); // Convert to Date
      end.setDate(end.getDate() + 1); // Add one day to the end date
      // console.log(end);
    } else {
      today = new Date();
      start = new Date(today);
      start.setDate(today.getDate() - 30);
      end = new Date(today); // Set end to one day after today
      end.setDate(today.getDate() + 1); // Add one day
      end = end.toISOString().split("T")[0];
    }

    const [sales, SoldProducts] = await Promise.all([
      createSalesReport(start, end),
      getMostSellingProducts(),
    ]);

    const allOrders = await getorders ()

    
    console.log("mp,",SoldProducts);
    if(sales === 0 ||SoldProducts==0 ){
      res.render("salesReport", {
       
        Mproducts: 0,
        sales:0,
      });
    }
   
    res.render("salesReport", {
      
      Mproducts: SoldProducts,
      sales,
      orders:allOrders
    });
  } catch (error) {
    console.error(error.message);
  }
};



// =================================== creating sales report ===================================================//


const createSalesReport = async (startDate, endDate) => {
  try {
    const orders = await Order.find({
      orderDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    if(!orders){
      return 0
    }

    const transformedTotalStockSold = {};
    const transformedProductProfits = {};

    const getProductDetails = async (productId) => {
      return await Product.findById(productId);
    };

    for (const order of orders) {
      for (const productInfo of order.products) {
        const productId = productInfo.productId;
        const quantity = productInfo.quantity;

        const product = await getProductDetails(productId);
        const productName = product.product_name;
        const image = product.images;
        const price = product.product_price;

        if (!transformedTotalStockSold[productId]) {
          transformedTotalStockSold[productId] = {
            id: productId,
            name: productName,
            quantity: 0,
            image: image,
            
          };
        }
        transformedTotalStockSold[productId].quantity += quantity;

        if (!transformedProductProfits[productId]) {
          transformedProductProfits[productId] = {
            id: productId,
            name: productName,
            profit: 0,
            image: image,
            price: price,
          };
        }
        const productPrice = product.product_price;
        const productCost = productPrice * 0.7;
        const productProfit = (productPrice - productCost) * quantity;
        transformedProductProfits[productId].profit += Math.floor(productProfit);
      }
    }

    const totalStockSoldArray = Object.values(transformedTotalStockSold);
    const productProfitsArray = Object.values(transformedProductProfits);

    const totalSales =Math.floor( productProfitsArray.reduce(
      (total, product) => total + product.profit,
      0
    ));

    const salesReport = {
      totalSales,
      totalStockSold: totalStockSoldArray,
      productProfits: productProfitsArray,
    };

    return salesReport;
  } catch (error) {
    console.error("Error generating the sales report:", error.message);
  }
};




// ================================================= finding most selling products ==========================================//


const getMostSellingProducts = async () => {
  try {
    const pipeline = [
  
    {
      $unwind: "$products",
    },
    {
      $match: {
        "products.OrderStatus": { $ne: "cancelled" } // Use "OrderStatus" instead of "orderStatus"
      }
    },
    {
      $group: {
        _id: "$products.productId",
        count: { $sum: "$products.quantity" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productData",
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 5, // Limit to the top 6 products
    },
  ];

    const mostSellingProducts = await Order.aggregate(pipeline);
    if(!mostSellingProducts){
      return 0
    }
    
    return mostSellingProducts;
  } catch (error) {
    console.error("Error fetching most selling products:", error);
    return [];
  }
};




const getorders = async () => {
  try {
    const orders = await Order.find().populate('userId')

    const productWiseOrdersArray = [];

    for (const order of orders) {
      for (const productInfo of order.products) {
        const productId = productInfo.productId;

        const product = await Product.findById(productId).select(
          "product_name images product_price"
        );
        const userDetails = await User.findById(order.userId).select("email");

        if (product) {
          // Push the order details with product details into the array
          productWiseOrdersArray.push({
            user: userDetails,
            product: product,
            orderDetails: {
              _id: order._id,
              userId: order.userId,
              shippingAddress: order.shippingAddress,
              orderDate: order.orderDate,
              totalAmount: productInfo.quantity * product.product_price,
              OrderStatus: productInfo.OrderStatus,
              StatusLevel: productInfo.StatusLevel,
              paymentStatus: productInfo.paymentStatus,
              paymentMethod: order.paymentMethod,
              quantity: productInfo.quantity,
              trackId:order.trackId
            },
          });
        }
      }
    }

   return productWiseOrdersArray;

  } catch (error) {
    console.log(error.message);
  }
};



//=====================================portfolio chart data filltering========================================//



const portfolioFiltering = async (req, res) => {
try {
  let datePriad = req.body.date;
  // console.log(datePriad);

  if (datePriad == "week") {
    let data = await generateWeeklySalesCount();
    // console.log(data);
    res.json({ data });
  } else if (datePriad == "month") {
    let data = await generateMonthlySalesCount();
    data = data.reverse();
    // console.log(data);

    res.json({ data });
  } else if (datePriad == "year") {
    let data = await generateYearlySalesCount();
    // console.log(data);
    res.json({ data });
  }
} catch (error) {
  console.log(error.message);
}
};


const generateWeeklySalesCount = async () => {
try {
  const weeklySalesCounts = [];

  const today = new Date();
  today.setHours(today.getHours() - 5);

  for (let i = 0; i < 7; i++) {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - i);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const orders = await Order.find({
      orderDate: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const salesCount = orders.length;

    weeklySalesCounts.push({
      date: startDate.toISOString().split("T")[0], // Format the date
      sales: salesCount,
    });
  }

  return weeklySalesCounts;
} catch (error) {
  console.error("Error generating the weekly sales counts:", error.message);
}
};



const generateMonthlySalesCount = async () => {
try {
  const monthlySalesCounts = [];

  const today = new Date();
  today.setHours(today.getHours() - 5);

  // Calculate the earliest and latest months
  const latestMonth = new Date(today);
  const earliestMonth = new Date(today);
  earliestMonth.setMonth(earliestMonth.getMonth() - 7); // 7 months ago

  // Create a map to store sales data for each month
  const salesData = new Map();

  // Iterate through the complete date range
  while (earliestMonth <= latestMonth) {
    const monthString = earliestMonth.toLocaleString("default", {
      month: "long",
    });
    salesData.set(monthString, 0);
    earliestMonth.setMonth(earliestMonth.getMonth() + 1);
  }

  // Populate sales data for existing months
  for (let i = 0; i < 7; i++) {
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - i);
    startDate.setDate(1);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);

    const orders = await Order.find({
      orderDate: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const salesCount = orders.length;
    const monthString = startDate.toLocaleString("default", {
      month: "long",
    });

    salesData.set(monthString, salesCount);
  }

  // Convert the map to an array for the final result
  for (const [date, sales] of salesData) {
    monthlySalesCounts.push({ date, sales });
  }

  return monthlySalesCounts;
} catch (error) {
  console.error("Error generating the monthly sales counts:", error.message);
}
};

const generateYearlySalesCount = async () => {
try {
  const yearlySalesCounts = [];

  const today = new Date();
  today.setHours(today.getHours() - 5);

  for (let i = 0; i < 7; i++) {
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - i);
    startDate.setMonth(0); // Set the start month to January
    startDate.setDate(1); // Set the start day to the first day of the year
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);

    const orders = await Order.find({
      orderDate: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    const salesCount = orders.length;

    yearlySalesCounts.push({
      date: startDate.getFullYear(),
      sales: salesCount,
    });
  }

  return yearlySalesCounts;
} catch (error) {
  console.error("Error generating the yearly sales counts:", error.message);
}
};


module.exports ={
  loadSalesReport,
  portfolioFiltering,
}