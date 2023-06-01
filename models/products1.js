const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
 
 /* status:{// NEW/on sale/50% off .....etc.
    type: String,
  },*/
  image1: {
    type: String,
    required: true
  }
 
  
},{ timestamps: true });

const Product = new  mongoose.model('Product1', productSchema);

module.exports = Product;