/**
 * Cart.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "cart_item",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
    },
    cart_id: {
      model: "cart",
    },
    product_id: {
      type: "number",
    },

    quantity: {
      type: "number",
    },
    price: {
      type: "number",
    },
    discount: {
      type: "number",
    },
    send_price: {
      type: "number",
    },
    status: {
      type: "string",
    },
    pay_type: {
      type: "string",
    },
    createdAt: {
      type: "number",
    },
    updatedAt: {
      type: "number",
    },
  },

  add: (input, userInfo, callback) => {
    let user_id = userInfo.id;
    /*--- validate Input ---*/
    let price = "";
    if (input.price) {
      price = input.price + "";
      price = parseFloat(price.replace(new RegExp(",", "g"), ""));
    }

    let discount = null;
    if (input.discount) {
      discount = input.discount + "";
      discount = parseFloat(discount.replace(new RegExp(",", "g"), ""));
    }

    let send_price = null;
    if (input.send_price) {
      send_price = input.send_price + "";
      send_price = parseFloat(send_price.replace(new RegExp(",", "g"), ""));
    }

    Cart.findOne({ where: { user_id: user_id, completed: 0 } }).exec(
      (err, cart) => {
        if (err) {
          return callback(false, null);
        }
        if (cart) {
          CartItem.create({
            cart_id: cart.id,
            product_id: input.product_id,
            quantity: input.quantity,
            price: price,
            discount: input.discount ? input.discount : "0",
            send_price: input.send_price,
            status: input.status ? input.status : "1",
            pay_type: input.pay_type ? input.pay_type : "1",
            createdAt: new Date() / 1000,
            updatedAt: new Date() / 1000,
          })
            .fetch()
            .exec((err, result) => {
              if (err) return callback(err, "");

              return callback(false, result);
            });
        } else return callback(err, "");
      }
    );
  },

  getList: (param, callback) => {
    Cart.findOne({
      user_id: param.id,
      completed: 0,
    }).exec((err, cartinfo) => {
      if (err) {
        return callback(false, null, null);
      }
      if (cartinfo) {
        CartItem.find({ cart_id: cartinfo.id }).exec((err, cartItemList) => {
          if (err) return callback(false, null, null);
          let total = [];
          async.eachOf(
            cartItemList,
            (targetItem, itemIndex, eachofCallback) => {
              async.parallel(
                {
                  ProductInfo: (callback) => {
                    try {
                      Product.getProductInfo(
                        targetItem.product_id,
                        false,
                        callback
                      );
                    } catch (err) {
                      console.log(err);
                    }
                  },
                  Factor: (callback) => {
                    try {
                      CartItem.getFactorInfo(
                        targetItem.price,
                        targetItem.quantity,
                        targetItem.discount,
                        targetItem.send_price,
                        callback
                      );
                    } catch (err) {
                      console.log(err);
                    }
                  },
                },

                (err, itemExtraInfo) => {
                  if (err) {
                    return eachofCallback(true, err);
                  }
                  cartItemList[itemIndex]["ProductInfo"] =
                    itemExtraInfo.ProductInfo;

                  cartItemList[itemIndex]["Factor"] = itemExtraInfo.Factor;
                  let price = cartItemList[itemIndex].price;
                  let quantity = cartItemList[itemIndex].quantity;
                  let totalPrice = price * quantity;
                  let sendPrice = cartItemList[itemIndex].send_price;
                  let discount = cartItemList[itemIndex].discount;

                  let factor = {
                    totalPrice: totalPrice,
                    sendPrice: sendPrice,
                    discount: discount,
                  };
                  total.push(factor);
                  return eachofCallback(false, cartItemList);
                }
              );
            },
            function (err) {
              //-- final callback of eachof
              let newList = [];
              for (index in cartItemList) {
                if (cartItemList[index] !== "empty")
                  newList.push(cartItemList[index]);
              }
              let totalPrice = 0;
              let totalSendPrice = 0;
              let totalDiscount = 0;
              // console.log(total[0].totalPrice);
              for (i in total) {
                totalPrice += total[i].totalPrice;
                totalSendPrice += total[i].sendPrice;
                totalDiscount += total[i].discount;
              }
              total = totalPrice - totalDiscount + totalSendPrice;
              let finalFactor = [];
              let factor = {
                totalPrice: totalPrice,
                totalSendPrice: totalSendPrice,
                totalDiscount: totalDiscount,
                total: total,
              };

              finalFactor.push(factor);

              callback(err, cartinfo, newList, finalFactor);
            }
          );
        });
      } else return callback(true, null, null);
    });
  },

  getFactorInfo: (price, quantity, discount, send_price, finalCallback) => {
    let Factor = [];

    let totalPrice = price * quantity;
    let totalDiscount = totalPrice * (discount / 100);
    let sendPrice = send_price;
    let total = totalPrice - totalDiscount - sendPrice;
    let factorDetail = {
      totalPrice: totalPrice,
      totalDiscount: totalDiscount,
      sendPrice: send_price,
      total: total,
    };
    Factor.push(factorDetail);
    return finalCallback(false, Factor);
  },
};
