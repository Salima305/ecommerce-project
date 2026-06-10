const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Address = require("../models/addressModel");
const { applyCoupon } = require("../controllers/authControllers");
const razorpay = require("../config/razorpay");
const mongoose = require("mongoose");
const crypto = require("crypto");
const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");

const signup = async (
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
) => {
  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return { success: false, message: "Email already exists" };
    }
    if (password !== confirmPassword) {
      return { success: false, message: "Password doesn't match" };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    return { success: true, user: newUser };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const login = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, message: "User not found" };
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: "Incorrect password" };
    } else {
      return { success: true, user };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const getProducts = async (search, category) => {
  try {
    let filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .populate("category");
    return products;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getCategories = async () => {
  try {
    const categories = await Category.find({ isBlocked: false });
    return categories;
  } catch (error) {
    return [];
  }
};

const getoneProduct = async (id) => {
  try {
    const product = await Product.findById(id).populate("category");
    return product;
  } catch (error) {
    return [];
  }
};

const addToCart = async (userId, productId) => {
  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [
          {
            product: productId,
            quantity: 1,
          },
        ],
      });
    } else {
      const existingitem = cart.items.find(
        (item) => item.product && item.product.toString() === productId,
      );

      if (existingitem) {
        existingitem.quantity += 1;
      } else {
        cart.items.push({
          product: productId,
          quantity: 1,
        });
      }
    }

    await cart.save();

    return {
      success: true,
      message: "Item added to cart",
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "Error adding to cart",
    };
  }
};

const clearCart = async (userId) => {
  try {
    const cart = await Cart.deleteOne({ userId });
    return { success: true, message: "Cart is cleared" };
  } catch (error) {
    return { success: false, message: "Error in clearing cart" };
  }
};

const cartItems = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId }).populate("items.product");

    return cart;
  } catch (error) {
    console.log(error);

    return null;
  }
};

const applyCoupon1 = async (userId, code) => {
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),

    isActive: true,
  });

  if (!coupon) {
    throw new Error("Invalid coupon");
  }

  const cart = await Cart.findOne({
    userId,
  }).populate("items.product");

  let subtotal = 0;

  cart.items.forEach((item) => {
    subtotal += item.product.price * item.quantity;
  });

  if (subtotal < coupon.minAmount) {
    throw new Error(`Minimum purchase ₹${coupon.minAmount}`);
  }

  const discountAmount = subtotal * (coupon.discount / 100);

  const finalTotal = subtotal - discountAmount;

  return {
    discountAmount,

    finalTotal,
  };
};

const userProfile = async (userId) => {
  const user = await User.findById(userId);
  return user;
};

const updateProfile = async (userId, data) => {
  const { firstName, lastName, email, phone, dob, gender } = data;
  await User.findByIdAndUpdate(userId, {
    firstName,
    lastName,
    email,
    phone,
    dob,
    gender,
    name: `${firstName} ${lastName}`,
  });
};

const getUserAddress = async (userId) => {
  const address = await Address.find({ userId });
  return address;
};

const addAddress = async (addressData) => {
  const newAddress = new Address(addressData);
  const { userId, phone, pincode } = addressData;
  const existing = await Address.findOne({ userId, phone, pincode });
  if (existing) {
    throw new Error("Address already exists ❗️");
  }
  const savedAddress = await newAddress.save();
  return savedAddress;
};

const deleteUserAddress = async (Id, userId) => {
  await Address.findByIdAndDelete(Id);
};

const updateUserAddress = async (Id, userId, data) => {
  await Address.findByIdAndUpdate(Id, {
    fullName: data.fullName,
    phone: data.phone,
    house: data.house,
    area: data.area,
    landmark: data.landmark,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
  });
};

const changeUSerPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatch) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
};

const createOrder = async ({ userId }) => {
  const cart = await Cart.findOne({ userId }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < item.quantity) {
      throw new Error(`${product.name} is out of stock`);
    }

    subtotal += product.price * item.quantity;
  }

  const shipping = subtotal > 0 ? 50 : 0;

  const finalAmount = subtotal + shipping;

  const razorpayOrder = await razorpay.orders.create({
    amount: finalAmount * 100,

    currency: "INR",

    receipt: `receipt_${Date.now()}`,
  });

  return razorpayOrder;
};

const saveOrder = async ({
  userId,
  addressId,
  razorpayOrderId,
  razorpayPaymentId,
  paymentMethod,
  discountAmount = 0,
  couponCode = null,
}) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found.");
  const address = await Address.findOne({ _id: addressId, userId }).lean();

  if (!address) throw new Error("Address not found.");
  const cart = await Cart.findOne({ userId }).populate("items.product");

  if (!cart || cart.items.length === 0) throw new Error("Cart is empty.");

  const lineItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product || product.isBlocked) {
      throw new Error(`"${product?.name}" is no longer available.`);
    }
    if (product.stock < item.quantity) {
      throw new Error(
        `"${product.name}" has only ${product.stock} unit(s) left in stock.`,
      );
    }
    const itemSubtotal = product.price * item.quantity;
    subtotal += itemSubtotal;
    lineItems.push({
      product: product._id,
      name: product.name,
      image: product.image || [],
      price: product.price,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });
  }
  const shippingCharge = 50;
  const total = subtotal + shippingCharge;

  const addressSnapshot = {
    fullName: address.fullName,
    line1: `${address.house}, ${address.area}`,
    line2: address.landmark || "",
    city: address.city,
    state: address.state,
    pincode: address.pincode,
  };
  let order;

  try {
    for (const item of cart.items) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.product._id,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        },
        {
          returnDocument: "after",
        },
      );

      if (!updated) {
        throw new Error(`"${item.product.name}" just ran out of stock.`);
      }
    }
    console.log("FINAL ORDER DATA:", {
      addressId,

      discountAmount,

      couponCode,
    });
    const orderData = await Order.create({
      customer: {
        firstName: user.firstName,
        email: user.email,
        phone: user.phone,
      },

      items: lineItems,

      pricing: {
        subtotal,
        shipping: shippingCharge,
        discount: discountAmount,
        total: subtotal + shippingCharge - discountAmount,
      },
      couponCode: couponCode,

      shippingAddress: addressSnapshot,

      status: paymentMethod === "cod" ? "pending" : "paid",

      ...(razorpayOrderId && { razorpayOrderId }),

      notes: "",
    });

    if (paymentMethod !== "cod" && razorpayOrderId) {
      orderData.razorpayOrderId = razorpayOrderId;
    }
    const order = await Order.create(orderData);
    if (paymentMethod.toLowerCase() !== "cod") {
      await Payment.create({
        order: order._id,

        razorpayOrderId,

        razorpayPaymentId,

        amount: total * 100,

        currency: "INR",

        event: "captured",
      });
    }
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

    return order;
  } catch (err) {
    console.log(err);

    if (razorpayPaymentId && paymentMethod !== "cod") {
      try {
        await razorpay.payments.refund(razorpayPaymentId, {
          notes: { reason: err.message },
        });

        console.log(`[REFUND] Initiated for payment ${razorpayPaymentId}`);
      } catch (refundErr) {
        console.error(refundErr);
      }
    }

    throw err;
  }
};

const SingleOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  return order;
};

const getUserOrders = async (email) => {
  const orders = await Order.find({ "customer.email": email }).sort({
    createdAt: -1,
  });
  return orders;
};

const cancelOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) return { success: false, message: "Order not found" };
  if (order.status !== "pending") {
    return { success: false, message: "Order cannot be cancelled" };
  }

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }
  order.status = "cancelled";
  order.cancelledAt = new Date();
  await order.save();
  return { success: true, order };
};

const returnOrder = async (orderId, reason) => {
  const order = await Order.findById(orderId);
  if (!order) return { success: false, message: "Order not found" };
  if (order.status !== "delivered") {
    return { success: false, message: "Only delivered orders can be returned" };
  }
  order.status = "return-requested";
  order.returnReason = reason;
  order.returnRequestedAt = new Date();
  await order.save();
  return { success: true, order };
};

module.exports = {
  signup,
  login,
  getProducts,
  getCategories,
  getoneProduct,
  addToCart,
  cartItems,
  applyCoupon1,
  userProfile,
  updateProfile,
  getUserAddress,
  addAddress,
  deleteUserAddress,
  updateUserAddress,
  changeUSerPassword,
  createOrder,
  saveOrder,
  SingleOrder,
  getUserOrders,
  cancelOrder,
  returnOrder,
  clearCart,
};
