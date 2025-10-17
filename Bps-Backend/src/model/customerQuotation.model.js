import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Customer",
  },
  startStation: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "manageStation",
  },
  startStationName: {
    type: String,
    required: true,
  },
  endStation: {
    type: String,
    required: true
  },

  firstName: String,
  middleName: String,
  lastName: String,
  mobile: String,
  email: String,
  locality: String,

  quotationDate: {
    type: Date,
    required: true
  },
  proposedDeliveryDate: {
    type: Date,
    required: true
  },

  fromCustomerName: {
    type: String,
    required: true
  },
  fromAddress: {
    type: String,
    required: true
  },
  fromCity: {
    type: String,
    required: true
  },
  fromState: {
    type: String,
    required: true
  },
  fromPincode: {
    type: String,
    required: true
  },

  toCustomerName: {
    type: String,
    required: true
  },
  toAddress: {
    type: String,
    required: true
  },
  toCity: {
    type: String,
    required: true
  },
  toState: {
    type: String,
    required: true
  },
  toPincode: {
    type: String,
    required: true
  },

  additionalCmt: String,
  sTax: {
    type: Number,
    required: true
  },
  sgst: {
    type: Number,
    // required: true
  },
  grandTotal: {
    type: Number,
  },
  amount: {
    type: Number,
    required: true,
  },
  freight: {
    type: Number,
    // required:true
  },
  productDetails: [
    {
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      weight: {
        type: Number,
        required: true
      },
    },
  ],

  activeDelivery: {
    type: Boolean,
    default: false
  },
  totalCancelled: {
    type: Number,
    default: 0
  },
  invoiceGenerated: {
    type: Boolean,
    default: false,
  },
  createdByRole: {
    type: String,
    enum: ['admin', 'supervisor'],

  },
  createdByUser: {
    type: String,

  },
  orderId: {
    type: String,
    default: null
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });


quotationSchema.pre("save", async function (next) {
  // Only generate if not already set
  if (!this.bookingId) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    this.bookingId = `BHPAR${randomNumber}QUOK`;
  }


  // quotationSchema.virtual("bookingRequestTotal").get(function () {
  //   return this.productDetails.reduce((acc, item) => acc + item.quantity, 0);
  // });

  // quotationSchema.virtual("totalTax").get(function () {
  //   return this.sTax + this.sgst + this.freight;
  // });

  // quotationSchema.virtual("computedTotalRevenue").get(function () {

  //   const productTotal = this.productDetails.reduce((acc, item) => {
  //     return acc + (item.price * item.quantity);
  //   }, 0);


  //   const totalRevenue = productTotal - (this.sTax + this.sgst) + this.amount;

  //   return totalRevenue;
  // });
  // const productTotal = this.productDetails.reduce((acc, item) => {
  //   return acc + item.price * item.quantity;
  // }, 0);
  // this.grandTotal = productTotal + this.sTax + this.sgst + this.amount;

  next();
});

// quotationSchema.set("toJSON", { virtuals: true });
// quotationSchema.set("toObject", { virtuals: true });

const Quotation = mongoose.models.Quotation || mongoose.model("Quotation", quotationSchema);

export default Quotation;
