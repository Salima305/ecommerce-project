const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");

const adminLogin = async (email, password) => {
  try {
    const adminUser = await Admin.findOne({ email });

    if (!adminUser) {
      return { success: false, message: "admin not found" };
    }
    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) return { success: false, message: "invalid password" };
    if (isMatch) return { success: true, admin: adminUser };
  } catch (error) {
    return { success: false, message: "error" };
  }
};

const getDashboardData = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$pricing.total" },
        },
      },
    ]);

    const revenue = revenueData[0]?.totalRevenue || 0;
    return {
      totalUsers,
      totalProducts,
      totalOrders,
      revenue,
    };
  } catch (error) {
    return {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
    };
  }
};

const getAllUsers = async () => {
  try {
    const users = await User.find();
    return users;
  } catch (error) {
    return [];
  }
};

const toggleUserStatus = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) return false;

    user.isBlocked = !user.isBlocked;
    await user.save();

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const getAllProducts = async (search, category) => {
  return await Product.find({
    name: { $regex: search, $options: "i" },
  }).populate("category");
};

const addProduct = async (data) => {
  const formattedName =
    data.name.trim().charAt(0).toUpperCase() +
    data.name.trim().slice(1).toLowerCase();
  const existing = await Product.findOne({
    name: { $regex: new RegExp(`^${formattedName}$`, "i") },
  });
  if (existing) {
    throw new Error("Product already exists ❗️");
  }
  return await Product.create({
    name: formattedName,
    price: data.price,
    stock: data.stock || 0,
    category: data.category,
    description: data.description,
    image: data.image || [],
  });
};

const editProduct = async (id) => {
  return await Product.findById(id);
};

const updateProduct = async (id, data) => {
  const updateData = {
    name: data.name,
    price: data.price,
    stock: data.stock,
    description: data.description,
  };

  if (data.category && data.category !== "") {
    updateData.category = data.category;
  }

  await Product.findByIdAndUpdate(id, updateData);
  if (data.image && data.image.length > 0) {
    await Product.findByIdAndUpdate(id, {
      $push: {
        image: { $each: data.image },
      },
    });
  }
};

const deleteProductImage = async (id, image) => {
  await Product.findByIdAndUpdate(id, {
    $pull: { image: image },
  });
};

const toggleProductStatus = async (id) => {
  const product = await Product.findById(id);
  product.isBlocked = !product.isBlocked;
  await product.save();
  return product;
};

const getAllCategories = async () => {
  return await Category.find();
};

const addCategory = async (name) => {
  const formattedName =
    name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
  const existing = await Category.findOne({
    name: { $regex: new RegExp(`^${formattedName}$`, "i") },
  });
  if (existing) {
    throw new Error("Category already exists");
  }
  return await Category.create({ name: formattedName });
};

const updateCategory = async (id, name) => {
  return await Category.findByIdAndUpdate(id, { name });
};

const toggleCategoryStatus = async (id, body) => {
  const cat = await Category.findById(id);
  cat.isBlocked = !cat.isBlocked;
  await cat.save();
  if (cat.isBlocked) {
    await Product.updateMany({ category: id }, { $set: { isBlocked: true } });
  } else if (body) {
    await Product.updateMany({ category: id }, { isBlocked: false });
  }
};

const getAllCoupons = async () => {
  return await Coupon.find().sort({ createdAt: -1 });
};

const addCoupon = async (data) => {
  const existing = await Coupon.findOne({
    code: { $regex: new RegExp(`^${data.code}$`, "i") },
  });
  if (existing) {
    throw new Error("Coupon code already exists");
  }
  return await Coupon.create(data);
};

const updateCoupon = async (id, body) => {
  const { code, discount, minAmount, maxAmount, expiryDate } = body;
  await Coupon.findByIdAndUpdate(id, {
    code,
    discount,
    maxAmount,
    minAmount,
    expiryDate,
  });
};

const toggleCoupon = async (id) => {
  const coupon = await Coupon.findById(id);
  coupon.isActive = !coupon.isActive;
  await coupon.save();
};

const getAllOrders = async () => {
  const orders = await Order.find().sort({ createdAt: -1 });
  return orders;
};

const updateStatus = async (orderId, status) => {
  const orderStatus = await Order.findByIdAndUpdate(
    orderId,
    { status: status },
    { new: true },
  );
  return orderStatus;
};

const getAnalytics = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const monthStart = new Date();
  monthStart.setDate(monthStart.getDate() - 30);

  const todayOrders = await Order.find({
    createdAt: {
      $gte: todayStart,
      $lte: todayEnd,
    },
  });

  const weekOrders = await Order.find({
    createdAt: {
      $gte: weekStart,
      $lte: new Date(),
    },
  });

  const monthOrders = await Order.find({
    createdAt: {
      $gte: monthStart,
    },
  });

  const topProducts = await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.name",
        totalSold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);

  const todayRevenue = todayOrders.reduce(
    (sum, order) => sum + (order.pricing.total || 0),
    0,
  );

  const weekRevenue = weekOrders.reduce(
    (sum, order) => sum + (order.pricing.total || 0),
    0,
  );

  const monthRevenue = monthOrders.reduce(
    (sum, order) => sum + (order.pricing.total || 0),
    0,
  );

  return {
    today: { orders: todayOrders.length, revenue: todayRevenue },
    week: { orders: weekOrders.length, revenue: weekRevenue },
    month: { orders: monthOrders.length, revenue: monthRevenue },
    topProducts,
  };
};

module.exports = {
  adminLogin,
  getDashboardData,
  getAllUsers,
  toggleUserStatus,
  getAllProducts,
  addProduct,
  editProduct,
  updateProduct,
  toggleProductStatus,
  getAllCategories,
  addCategory,
  updateCategory,
  toggleCategoryStatus,
  getAllCoupons,
  addCoupon,
  updateCoupon,
  toggleCoupon,
  deleteProductImage,
  getAllOrders,
  updateStatus,
  getAnalytics,
};
