import mongoose from "mongoose";
import { User } from "../model/user.model.js";
import { generateAndCommitReceiptNo } from "../utils/generateReceiptNo.js";

const quotationSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "QCustomer",
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
  toContactNumber: {
    type: String,
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
    default: 0
  },
  sgst: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
  },
  paidAmount: {
    type: Number,
    default: 0
  },

  deliveryPendingAmount: {
    type: Number,
    default: 0
  },

  paymentStatus: {
    type: String,
    enum: ["Paid", "Partial", "Unpaid"],
    default: "Unpaid"
  },
  amount: {
    type: Number,
    default: 0,
  },
  freight: {
    type: Number,
    default: 0
  },
  insVppAmount: {
    type: Number,
    default: 0,
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
      insurance: {
        type: Number,
      },
      vppAmount: {
        type: Number,
      },
      price: {
        type: Number,
        required: true
      },
      weight: {
        type: Number,
        required: true
      },
      topay: {
        type: String,
        required: true,
        enum: ["paid", "toPay", "none"],
      },
      receiptNo: {
        type: String,
        default: ""
      },
      refNo: {
        type: String,
        default: ""
      }
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for product total
quotationSchema.virtual("productTotal").get(function () {
  return this.productDetails.reduce(
    (acc, item) => acc + Number(item.price || 0),
    0
  );
});

// Virtual for total quantity
quotationSchema.virtual("bookingRequestTotal").get(function () {
  return this.productDetails.reduce((acc, item) => acc + item.quantity, 0);
});

// Virtual for total tax
quotationSchema.virtual("totalTax").get(function () {
  const productTotal = this.productTotal;
  const sTaxAmount = (productTotal * this.sTax) / 100;
  const sgstAmount = (productTotal * this.sgst) / 100;
  return sTaxAmount + sgstAmount;
});

// Virtual for computed total revenue
quotationSchema.virtual("computedTotalRevenue").get(function () {
  return (
    this.productTotal +        // base price
    this.totalTax +            // GST
    (this.freight || 0) +      // bilty
    (this.insVppAmount || 0)   // ✅ INS/VPP
  );
});

quotationSchema.pre("save", async function (next) {
  try {
    /* ===============================
       1️⃣ SAFE & UNIQUE BOOKING ID
    =============================== */
    if (!this.bookingId) {
      let unique = false;

      while (!unique) {
        const random = Math.floor(1000 + Math.random() * 9000);
        const time = Date.now().toString().slice(-4);
        const bookingId = `BHPAR${random}${time}QUOK`;

        const exists = await mongoose.models.Quotation.findOne({ bookingId });
        if (!exists) {
          this.bookingId = bookingId;
          unique = true;
        }
      }
    }

    /* ===============================
       2️⃣ GRAND TOTAL
    =============================== */
    this.grandTotal = this.computedTotalRevenue;

    /* ===============================
   3️⃣ PAID / TO PAY LOGIC (Quotation)
=============================== */

    let paidItemTotal = 0;
    let toPayItemTotal = 0;

    this.productDetails.forEach(item => {
      const amt = Number(item.price || 0) * Number(item.quantity || 1);

      if (item.topay === "paid") paidItemTotal += amt;
      if (item.topay === "toPay") toPayItemTotal += amt;
    });

    // ALL PAID
    if (paidItemTotal > 0 && toPayItemTotal === 0) {
      this.paidAmount = this.grandTotal;
      this.deliveryPendingAmount = 0;
    }
    // ALL TO PAY
    else if (toPayItemTotal > 0 && paidItemTotal === 0) {
      this.paidAmount = 0;
      this.deliveryPendingAmount = this.grandTotal;
    }
    // MIXED
    else {
      const total = paidItemTotal + toPayItemTotal;
      const paidRatio = total > 0 ? paidItemTotal / total : 0;

      this.paidAmount = Math.round(this.grandTotal * paidRatio);
      this.deliveryPendingAmount = this.grandTotal - this.paidAmount;
    }

    /* ===============================
       4️⃣ PAYMENT STATUS
    =============================== */

    if (this.paidAmount >= this.grandTotal) {
      this.paymentStatus = "Paid";
    } else if (this.paidAmount > 0) {
      this.paymentStatus = "Partial";
    } else {
      this.paymentStatus = "Unpaid";
    }


    /* ===============================
       3️⃣ RECEIPT NUMBER COMMIT
    =============================== */
    if (this.isNew && this.productDetails?.length) {

      // ✅ createdByUser = USER _id (ObjectId)
      const user = await User.findById(this.createdByUser);

      if (!user || !user.stationCode) {
        throw new Error("StationCode not found");
      }

      const receiptNo = await generateAndCommitReceiptNo(user.stationCode);

      // ✅ same receipt for all products
      this.productDetails = this.productDetails.map(item => ({
        ...item,
        receiptNo,
      }));
    }

    next();
  } catch (err) {
    next(err);
  }
});


const Quotation = mongoose.models.Quotation || mongoose.model("Quotation", quotationSchema);
export default Quotation;