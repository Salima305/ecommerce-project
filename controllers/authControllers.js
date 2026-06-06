const authServices = require("../services/authServices");
const { validationResult } = require("express-validator");
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const razorpay = require("../config/razorpay");
const order = require("../models/orderModel");
const crypto = require("crypto");
const User = require("../models/userModel");

const getSignup = async (req, res) => {
  const error = req.query.error;
  res.render("signup", { error });
};

const postSignup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({success:false,error:errors.array()[0].msg})
    }
    const { name, email, password, confirmPassword } = req.body;
    const result = await authServices.signup(
      name,
      email,
      password,
      confirmPassword,
    );
    if (result.success) {
      req.session.user={
        _id:result.user._id,
        name:result.user.name,
        email:result.user.email
      }
      res.json({success:true,redirectUrl:"/home"})
     
    } else {
      res.json({success:false,error:result.message})
    }
  } catch (error) {
    return res.json({success:false,error:error.message});
  }
};

const getLogin = async (req, res) => {
  const user = req.session.user;
  if (user) {
    return res.redirect("/home");
  } else {
    const error = req.query.error;
    res.render("login", { error });
  }
};

const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authServices.login(email, password);
    if (result.success) {
      req.session.user = result.user._id;
     const redirectUrl = req.query.redirect || '/home';
     res.json({ success: true, redirectUrl });
    } else {
   res.json({success:false,error:result.message})
    }
  } catch (error) {
   return res.json({success:false,error:error.message});
  }
};

const getHome = async (req, res) => {
  const user = req.session.user;
  const error = req.query.error;
  const message = req.query.message;
  res.render("home", { user, error, message });
};

const getCollectionPage = async (req, res) => {
  res.render("collection", { search: req.query.search || "" });
};

const getAllProducts = async (req, res) => {
  try {
    const category = req.query.category || "";
    const search = req.query.search || "";
    const products = await authServices.getProducts(search, category);
    const categories = await authServices.getCategories({ isBlocked: false });
    res.json({ status: true, data: { products, categories } });
  } catch (e) {
    console.log(e);
    res.json({ status: false, msg: "Error in product fetching" });
  }
};

const getDetailPage = async (req, res) => {
  res.render("productDetail");
};

const getProductDetails = async (req, res) => {
  try {
    const productId = req.query.id;
    const product = await authServices.getoneProduct(productId);
    res.json({ status: true, data: { product } });
  } catch (error) {
    console.log(error);
    res.json({ status: false, msg: "Error in product fetching" });
  }
};

const getCart = async (req, res) => {
  res.render("cart");
};

const addToCart = async (req, res) => {
  try {
    const userId = req.session.user;
    const { productId } = req.body;
    if (!userId) {
      return res.json({ status: false, message: "Please login first" });
    }

    const result = await authServices.addToCart(userId, productId);

    res.json({ status: true, message: result.message });
  } catch (error) {
    console.log(error);
    res.json({ status: false, message: "Error adding to cart" });
  }
};

const getcartData = async (req, res) => {
  const userId = req.session.user;
  const data = await authServices.cartItems(userId);
  res.json({ status: true, data: data });
};

const updateQty = async (req, res) => {
  try {
    const { productId, change } = req.body;
    const cart = await Cart.findOne({
      userId: req.session.user,
    });

    if (!cart) {
      return res.json({
        status: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (!item) {
      return res.json({
        status: false,
        message: "Item not found",
      });
    }

    item.quantity += change;

    if (item.quantity < 1) {
      item.quantity = 1;
    }

    await cart.save();

    res.json({
      status: true,
      message: "Quantity updated",
    });
  } catch (error) {
    console.log(error);

    res.json({
      status: false,
      message: "Something went wrong",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({
      userId: req.session.user,
    });

    if (!cart) {
      return res.json({
        status: false,
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );

    await cart.save();

    res.json({
      status: true,
    });
  } catch (error) {
    console.log(error);

    res.json({
      status: false,
    });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const result = await authServices.applyCoupon1(req.session.user, code);

    res.json({
      status: true,
      discountAmount: result.discountAmount,
      finalTotal: result.finalTotal,
    });
  } catch (error) {
    console.log(error);
    res.json({ status: false, message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  res.render("userProfile");
};

const getprofileData = async (req, res) => {
  try {
    const userId = req.session.user;
    const userData = await authServices.userProfile(userId);
    return res.json({ status: true, data: userData });
  } catch (error) {
    return res.json({
      status: false,
      message: "Failed to load profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.session.user;
    const { firstName,
    lastName,
    email,
    phone,
    dob,
    gender}=req.body
    if(!firstName||!lastName){
      return res.json({ status: false, message: "Name fields cannot be empty" });
    }
    if (phone&&!/^\d{10}$/.test(phone)){
      return res.json({ status: false, message:"Enter a valid 10-digit phone number"})
    }
        await authServices.updateProfile(userId, req.body);
    return res.json({ status: true });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.json({ status: false, message: "Failed to update profile" });
  }

};

const addAddress = async (req, res) => {
  try {
    const { fullName, phone, house, area, landmark, city, state, pincode } =
      req.body;

const fields=[fullName, house,area,city,state,pincode]
  if(fields.some(f=>!f)){
    
    return res.json({ status: false, message: "All fields are required" });
  }
if(!/^\d{10}$/.test(phone)){
  return res.json({ status: false, message: "Enter a valid 10-digit phone number"})
  }

if(!/^\d{6}$/.test(pincode)){
  return res.json({ status: false, message: "Enter a valid pincode"})
  }
    const userId = req.session.user;
    const addressData = { ...req.body, userId };
    const saveAddress = await authServices.addAddress(addressData);
    res.json({
      status: true,
      message: "Address added",
    });
  } catch (error) {
    console.log(error);

    res.json({
      status: false,
      message: error.message,
    });
  }
};

const getAddress = async (req, res) => {
  try {
    const userId = req.session.user;

    const addresses = await authServices.getUserAddress(userId);

    res.json({
      status: true,
      addresses,
    });
  } catch (error) {
    console.log(error);

    res.json({
      status: false,
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const Id = req.params.id;
    const userId = req.session.user;
    await authServices.deleteUserAddress(Id, userId);
    res.json({ success: true });
  } catch (error) {
    console.log(error);

    res.json({
      status: false,
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const Id = req.params.id;
    const userId = req.session.user;
    const { fullName, phone, house, area, landmark, city, state, pincode } =
      req.body;

const fields=[fullName, house,area,city,state,pincode]
  if(fields.some(f=>!f)){
    
    return res.json({ status: false, message: "All fields are required" });
  }
if(!/^\d{10}$/.test(phone)){
  return res.json({ status: false, message: "Enter a valid 10-digit phone number"})
  
}

if(!/^\d{6}$/.test(pincode)){
  return res.json({ status: false, message: "Enter a valid pincode"})

}

await authServices.updateUserAddress(Id, userId, {
      fullName,
      phone,
      house,
      area,
      landmark,
      city,
      state,
      pincode,
    });
    res.json({ status: true });
  } catch (error) {
    console.log(error);

    res.json({
      status: false,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.session.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;
       const fields=[currentPassword, newPassword, confirmPassword]
  if(fields.some(f=>!f)){
    return res.json({
        status: false,
        message:("All fields are required")
    })
  }
    if (newPassword !== confirmPassword) {
      return res.json({
        status: false,
        message: "passwords do not match",
      });
    }
if(newPassword.length < 8){
   return res.json({
        status: false,
        message: "passwords should contain min 8 characters",
      });
    }
    await authServices.changeUSerPassword(userId, currentPassword, newPassword);
    res.json({
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.json({ status: false, message: error.message });
  }
};

const getCheckout = async (req, res) => {
  res.render("checkout");
};

const getCheckoutData = async (req, res) => {
  try {
    const userId = req.session.user;
    const cart = await Cart.findOne({ userId }).populate("items.product");
    res.json({
      status: true,
      cart,
    });
  } catch (error) {
    console.log(error);

    res.json({
      status: false,
    });
  }
};

const postplaceOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod, discountAmount, couponCode } = req.body;
    const userId = req.session.user;
    if (paymentMethod === "cod") {
      const savedOrder = await authServices.saveOrder({
        userId,
        addressId,
        razorpayOrderId: null,
        razorpayPaymentId: null,
        paymentMethod: "cod",
        discountAmount: discountAmount || 0,
        couponCode: couponCode || null,
      });
      return res.json({
        status: true,
        paymentMethod: "cod",
        orderId: savedOrder._id,
      });
    }
    const razorpayOrder = await authServices.createOrder({
      addressId,
      paymentMethod,
      userId,
    });
    res.json({ status: true, razorpayOrder });
  } catch (error) {
    console.log(error);
    return res.json({ status: false, message: error.message });
  }
};

const postVerifyPayment = async (req, res) => {
  console.log(req.body);
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      addressId,
      discountAmount,
      couponCode,
    } = req.body;

    const crypto = require("crypto");

    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpaySignature) {
      return res.json({
        success: false,
        message: "Payment verification failed.",
      });
    }

    const userId = req.session.user;

    const order = await authServices.saveOrder({
      userId,
      addressId,
      razorpayOrderId,
      razorpayPaymentId,
      paymentMethod: "razorpay",
      discountAmount,
      couponCode,
    });

    return res.json({
      success: true,
      orderId: order._id,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

const getOrderConfirmation = async (req, res) => {
  res.render("confirmation");
};

const getSingleOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
     const order = await authServices.SingleOrder(orderId);

    if (!order) {
      return res.json({
        status: false,
        message: "Order not found",
      });
    }

    res.json({
      status: true,
      order,
    });
  } catch (error) {
    console.log(error);

    res.json({
      status: false,
      message: "Failed to load order",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await User.findById(userId).lean();
    const order = await authServices.getUserOrders(user.email);
    res.json({
      status: true,
      order,
    });
  } catch (error) {
    console.log(error);

    res.json({
      status: false,
      message: "Failed to load order",
    });
  }
};

const getOrderDetailPage = async (req, res) => {
  res.render("orderDetail");
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const result = await authServices.cancelOrder(orderId);
    if (result.success) {
      return res.json({
        status: true,
        message: "Order cancelled successfully",
      });
    } else {
      return res.json({ status: false, message: result.message });
    }
  } catch (error) {
    console.log(error);
    res.json({ status: false, message: error.message });
  }
};

const returnOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;
    const result = await authServices.returnOrder(orderId, reason);
    if (result.success) {
      res.json({ status: true, message: "Return request sent successfully" });
    } else {
      return res.json({ status: false, message: result.message });
    }
  } catch (error) {
    console.log(error);
    res.json({ status: false, message: error.message });
  }
};

const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect(`/home?error=${err.message}`);
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};

module.exports = {
  getSignup,
  postSignup,
  getLogin,
  postLogin,
  getHome,
  getCollectionPage,
  getAllProducts,
  getDetailPage,
  getProductDetails,
  getCart,
  addToCart,
  getcartData,
  removeFromCart,
  updateQty,
  applyCoupon,
  getUserProfile,
  getprofileData,
  updateProfile,
  addAddress,
  getAddress,
  deleteAddress,
  updateAddress,
  changePassword,
  getCheckout,
  getCheckoutData,
  logout,
  postplaceOrder,
  postVerifyPayment,
  getOrderConfirmation,
  getSingleOrder,
  getMyOrders,
  getOrderDetailPage,
  cancelOrder,
  returnOrder,
};
