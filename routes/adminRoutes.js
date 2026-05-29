const express=require("express") 
const adminController=require("../controllers/adminControllers")
const isAdmin = require("../middleware/adminMiddleware")
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = require("../middleware/upload")

const router=express.Router()


router.get("/login",adminController.getlogin)
router.post("/login",adminController.login)
router.get("/dashboard",isAdmin,adminController.getDashboard)
router.get("/users",isAdmin,adminController.getUsers)
router.put("/users/toggle/:id",isAdmin,adminController.toggleUser)
router.get("/products",adminController.getProducts)
router.get("/products/add",adminController.getAddProduct)
router.get("/products/edit/:id",adminController.getEditProduct)
router.put("/products/edit/:id",upload.array("images",5),adminController.postEditProduct)
router.put("/products/toggle/:id", adminController.toggleProduct);
router.post("/products/add",upload.array("images", 5),adminController.postAddProduct);
router.get("/categories", adminController.getCategories);
router.post("/categories/add", adminController.postAddCategory);
router.put("/categories/edit/:id", adminController.postEditCategory);
router.put("/categories/toggle/:id", adminController.toggleCategory);
router.get("/coupons", adminController.getCoupons);
router.post("/coupons/add", adminController.postAddCoupon);
router.put("/coupons/edit/:id",adminController.editCoupon)
router.put("/coupons/toggle/:id", adminController.toggleCoupon);
router.get("/logout", adminController.logout);
router.delete("/products/:id/image",adminController.deleteProductIm)
router.get("/orders",isAdmin,adminController.getOrders)
router.patch("/orders/:id/status",isAdmin,adminController.updateOrderStatus)
router.get("/orders-page", isAdmin, adminController.getOrdersPage)
router.get("/analytics", isAdmin, adminController.getAnalytics)
router.get("/analytics-page", isAdmin, adminController.getAnalyticsPage)


module.exports=router