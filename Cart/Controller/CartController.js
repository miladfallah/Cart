/**
 * ShopController
 *
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  add: (req, res) => {
    let input = req.body;
    let userInfo = req.userInfo;

    if (req.body.userInfo) userInfo = req.body.userInfo;
    if (!userInfo)
      return res.json({
        state: false,
        errorCode: -1,
        message: "user is not logged in",
      });

    async.waterfall(
      [
        function (next) {
          Cart.add(userInfo, function (err) {
            if (err) {
              console.log(err);
              return next(true);
            }
            return next(false);
          });
        },
        function (next) {
          CartItem.add(input, userInfo, function (err) {
            if (err) {
              return next(true);
            }
            return next(false);
          });
        },
      ],
      function (err, finalResult) {
        /** &)---- final ----**/
        if (err) return res.json(finalResult);

        return res.json({ state: true });
      }
    );
  },

  edit: async (req, res) => {
    let input = req.body;
    let userInfo = req.userInfo;

    if (req.body.userInfo) userInfo = req.body.userInfo;
    if (!userInfo)
      return res.json({
        state: false,
        errorCode: -1,
        message: "user is not logged in",
      });
    Cart.edit(input, userInfo, function (err, data) {
      if (err) {
        console.log(err);
        return res.json({ state: false, errorCode: -2, message: err });
      }
      return res.ok({ state: true, data: data });
    });
  },

  getList: (req, res) => {
    let userInfo = req.userInfo;
    if (req.body && !_.isEmpty(req.body.token)) userInfo = req.userInfo;
    if (!userInfo)
      return res.json({
        state: false,
        errorCode: -1,
        message: "user is not logged in",
      });
    let params = userInfo;
    CartItem.getList(params, function (err, cartinfo, data, fact) {
      if (err) return res.json({ state: false, errorCode: -2 });
      if (data && data.length) data.reverse();
      return res.ok({
        state: true,
        CartInfo: cartinfo,
        CartItemInfo: data,
        FinalFactor: fact,
      });
    });
  },
};
