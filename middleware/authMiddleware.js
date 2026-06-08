// const isAuth = (req, res, next) => {
//   if (req.session.user) {
//     next();
//   } else {
//     res.redirect("/login");
//   }
// };
// module.exports = isAuth;

const isAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    if (req.headers['content-type']  && req.headers['content-type'].includes("application/json")) {
      res.status(401).json({ status: false, message: "Please login first" });
    } else {
      res.redirect("/login");
    }
  }
};

module.exports = isAuth;