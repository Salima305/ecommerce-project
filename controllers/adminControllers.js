const express = require("express");
const adminService = require("../services/adminServices");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");

const getlogin = async (req, res) => {
  const admin = req.session.adminId;
  if (admin) {
    return res.redirect("/admin/dashboard");
  } else {
    const error = req.query.error;
    res.render("adminLogin", { error: null });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await adminService.adminLogin(email, password);

    if (result.success) {
      req.session.adminId = result.admin._id;
      return res.redirect("/admin/dashboard");
    } else {
      return res.render("adminLogin", { error: result.message });
    }
  } catch (error) {
    res.render("adminLogin", { error: "something went wrong" });
  }
};

const getDashboard = async (req, res) => {
  const data = await adminService.getDashboardData();
  res.render("adminDashboard", {
    totalUsers: data.totalUsers,
    totalProducts: data.totalProducts,
    totalOrders: data.totalOrders,
    totalRevenue: data.revenue,
    activePage: "dashboard",
  });
};

const getUsers = async (req, res) => {
  const users = await adminService.getAllUsers();
  res.render("adminUsers", {
    users,
    activePage: "users",
  });
};

const toggleUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await adminService.toggleUserStatus(userId);

    if (!result) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Status updated" });
  } catch (error) {
    res.json({ success: false, message: "Something went wrong" });
  }
};

const getProducts = async (req, res) => {
  const search = req.query.search || "";
  const category = req.query.category;
  const products = await adminService.getAllProducts(search, category);
  const categories = await Category.find({ isBlocked: false });

  res.render("adminProducts", {
    products,
    categories,
    title: "products",
    activePage: "products",
  });
};

const getAddProduct = async (req, res) => {
  const categories = await Category.find({ isBlocked: false });
  res.render("addProduct", {
    title: "Add Product",
    activePage: "products",
    categories,
  });
};

const postAddProduct = async (req, res) => {
  try {
    const images = req.files.map((file) => file.filename);
    await adminService.addProduct({
      name: req.body.name,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      description: req.body.description,
      image: images,
    });
    res.json({ message: "product added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEditProduct = async (req, res) => {
  const id = req.params.id;
  const product = await adminService.editProduct(id);
  const categories = await Category.find({ isBlocked: false });

  res.render("editProduct", {
    product,
    categories,
  });
};

const postEditProduct = async (req, res) => {
  const id = req.params.id;
  const images = req.files ? req.files.map((file) => file.filename) : [];
  await adminService.updateProduct(id, { ...req.body, image: images });
  res.json({ message: "Product updated successfully" });
};

const deleteProductIm = async (req, res) => {
  const id = req.params.id;
  const { image } = req.body;
  await adminService.deleteProductImage(id, image);
  res.json({ success: true });
};

const toggleProduct = async (req, res) => {
  const productId = req.params.id;
  const updated = await adminService.toggleProductStatus(productId);
  res.json({
    success: true,
    isBlocked: updated.isBlocked,
  });
};

const getCategories = async (req, res) => {
  const categories = await adminService.getAllCategories();
  res.render("adminCategories", {
    categories,
    title: "Category Management",
    activePage: "categories",
  });
};

const postAddCategory = async (req, res) => {
  try {
    await adminService.addCategory(req.body.name);
    res.json({ message: "Category added" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const postEditCategory = async (req, res) => {
  await adminService.updateCategory(req.params.id, req.body.name);
  res.json({ message: "Updated successfully" });
};

const toggleCategory = async (req, res) => {
  const { enableProducts } = req.body;
  console.log(req.body);
  await adminService.toggleCategoryStatus(req.params.id, enableProducts);
  res.json({ success: true });
};

const getCoupons = async (req, res) => {
  const coupons = await adminService.getAllCoupons();

  res.render("adminCoupons", {
    coupons,
    title: "Coupons",
    activePage: "coupons",
  });
};

const postAddCoupon = async (req, res) => {
  try {
    await adminService.addCoupon(req.body);
    res.json({ success: true });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    res.status(400).json({ message: error.message });
  }
};

const editCoupon = async (req, res) => {
  const id = req.params.id;
  await adminService.updateCoupon(id, req.body);
  res.json({ message: "Updated successfully" });
};

const toggleCoupon = async (req, res) => {
  await adminService.toggleCoupon(req.params.id);
  res.json({ success: true });
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
};

const getOrders = async (req, res) => {
  try {
    const orders = await adminService.getAllOrders();
    res.json({ status: true, orders: orders });
  } catch (error) {
    console.log(error);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const orderStatus = await adminService.updateStatus(orderId, status);
    res.json({ status: true, message: "Status updated" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getOrdersPage = async (req, res) => {
  res.render("adminOrders", {
    activePage: "orders",
  });
};

const getAnalytics = async (req, res) => {
  try {
    const data = await adminService.getAnalytics();
    return res.json({ status: true, data });
  } catch (error) {
    console.log(error);
  }
};

const getAnalyticsPage = async (req, res) => {
  res.render("adminAnalytics", { activePage: "analytics" });
};

module.exports = {
  getlogin,
  login,
  getDashboard,
  getUsers,
  toggleUser,
  getProducts,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  toggleProduct,
  getCategories,
  postAddCategory,
  postEditCategory,
  toggleCategory,
  getCoupons,
  postAddCoupon,
  editCoupon,
  toggleCoupon,
  logout,
  deleteProductIm,
  getOrders,
  updateOrderStatus,
  getOrdersPage,
  getAnalytics,
  getAnalyticsPage,
};
