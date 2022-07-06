/**
 * Cart.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: "cart",
  attributes: {
    id: {
      type: "number",
      autoIncrement: true,
    },
    user_id: {
      model: "user",
    },
    address: {
      type: "string",
    },
    mob_number: {
      type: "string",
    },
    completed: {
      type: "string",
      allowNull: true,
    },
    cartitems: {
      collection: "cartitem",
      via: "cart_id",
    },
    createdAt: {
      type: "number",
    },
    updatedAt: {
      type: "number",
      allowNull: true,
    },
  },
  add: (userInfo, callback) => {
    let user_id = userInfo.id;
    Cart.findOne({ user_id: user_id, completed: 0 }).exec((err, cart) => {
      if (err) {
        return callback(false, null);
      }
      if (!cart) {
        Cart.create({
          user_id: user_id,
          address: "",
          completed: "0",
          mob_number: "0",
          createdAt: new Date() / 1000,
          updatedAt: new Date() / 1000,
        })
          .fetch()
          .exec((err, result) => {
            if (err) return callback(err, "");
            return callback(false, result);
          });
      } else {
        return callback(false, null);
      }
    });
  },

  edit: (input, userInfo, callback) => {
    let user_id = userInfo.id;

    let address = "";
    if (input.address) address = input.address;

    let mob_number = "";
    if (input.mob_number) mob_number = input.mob_number;
    Cart.updateOne({
      user_id: user_id,
      completed: 0,
    })
      .set({
        address: address,
        mob_number: mob_number,
        update_time: new Date() / 1000,
      })
      .exec((err, result) => {
        if (err) return callback(err, "");
        return callback(false, result);
      });
  },
};
