import mongoose from 'mongoose';
import { User } from "../model/user.model.js";
import { generateAndCommitBookingReceiptNo } from "../utils/generateReceiptNo.js";

// Single shipment item schema
const ItemSchema = new mongoose.Schema({
  receiptNo: {
    type: String,
    required: true
  },
  refNo: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  insurance: {
    type: Number,
    required: true
  },
  vppAmount: {
    type: Number,
    required: true
  },
  toPay: {
    type: String,
    required: true,
    enum: ['toPay', 'paid', 'none']
  },
  weight: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
});

const BookingSchema = new mongoose.Schema(
  {
    // Auto-generated booking ID
    bookingId: {
      type: String,
      unique: true
    },

    // Start & end stations
    startStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'manageStation',
      required: true
    },
    endStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'manageStation',
      required: true
    },

    // Customer info
    firstName: {
      type: String,

    },
    middleName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,

    },
    mobile: {
      type: String,

    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: (v) =>
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(v),
        message: (props) => `${props.value} is not a valid email address!`
      }
    },
    locality: {
      type: String
    },

    // Booking & delivery dates
    bookingDate: {
      type: Date,
      required: true
    },
    deliveryDate: {
      type: Date,
      required: true
    },

    // Sender information
    senderName: {
      type: String,
      required: true
    },
    senderGgt: {
      type: String,
      required: true
    },
    senderLocality: {
      type: String,
      required: true
    },
    fromState: {
      type: String,
      required: true
    },
    fromCity: {
      type: String,
      required: true
    },
    senderPincode: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^\d{6}$/.test(v),
        message: (props) => `${props.value} is not a valid pincode!`
      }
    },

    // Receiver information
    receiverName: {
      type: String,
      required: true
    },
    receiverContact: {
      type: String
    },
    receiverEmail: {
      type: String
    },
    receiverGgt: {
      type: String,
      required: true
    },
    receiverLocality: {
      type: String,
      required: true
    },
    toState: {
      type: String,
      required: true
    },
    toCity: {
      type: String,
      required: true
    },
    toPincode: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^\d{6}$/.test(v),
        message: (props) => `${props.value} is not a valid pincode!`
      }
    },

    // Shipment items
    items: {
      type: [ItemSchema],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one item is required.'
      }
    },

    // Optional comments
    addComment: {
      type: String,
      default: ''
    },

    // Charges
    freight: {
      type: Number,
      required: true
    },
    ins_vpp: {
      type: Number,
      required: true
    },
    cgst: {
      type: Number,
      required: true
    },
    sgst: {
      type: Number,
      required: true
    },
    igst: {
      type: Number,
      required: true
    },

    // Calculated totals
    billTotal: {
      type: Number
    },
    grandTotal: {
      type: Number
    },
    computedTotalRevenue: {
      type: Number,
      default: function () {
        return this.grandTotal;
      }
    },
    // Payments
    paidAmount: {
      type: Number,
      default: 0
    },
    pickupCollectedAmount: {
      type: Number,
      default: 0
    },

    deliveryPendingAmount: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partial', 'Unpaid'],
      default: 'Unpaid'
    },

    // Status
    activeDelivery: {
      type: Boolean,
      default: false
    },
    orderId: {
      type: String,
      default: null
    },

    totalCancelled: {
      type: Number,
      default: 0
    },
    invoiceGenerated: {
      type: Boolean,
      default: false
    },
    createdByUser: {
      type: String,

    },

    invoiceNumber: { type: String, index: true, sparse: true }, // not unique because a single invoice can cover many bookings
    invoiceRef: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    invoiceNo: { type: String, default: null },
    billDate: { type: Date },
    createdByRole: {
      type: String,
      enum: ['admin', 'supervisor'],

    },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    isApproved: { type: Boolean, default: false },
    requestedByRole: { type: String, default: 'public' },
    approvedBy: { type: String },
    approvedAt: { type: Date },

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

  },
  { timestamps: true }
);

BookingSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Auto-generate booking ID
BookingSchema.pre('validate', function (next) {
  if (!this.bookingId) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    this.bookingId = `BHPAR${randomDigits}BOOK`;
  }
  next();
});

BookingSchema.pre("save", async function (next) {
  try {
    /* -----------------------------
       1️⃣ BILL TOTAL
    ----------------------------- */
    if ((this.billTotal === undefined || this.billTotal === null) && Array.isArray(this.items)) {
      this.billTotal = this.items.reduce(
        (sum, i) => sum + (Number(i.amount) || 0),
        0
      );
    }

    /* -----------------------------
       2️⃣ GRAND TOTAL
    ----------------------------- */
    if (this.grandTotal === undefined || this.grandTotal === null) {
      this.grandTotal =
        (this.billTotal || 0) +
        (this.freight || 0) +
        (this.ins_vpp || 0) +
        (this.cgst || 0) +
        (this.sgst || 0) +
        (this.igst || 0);
    }

    this.computedTotalRevenue = this.grandTotal;

    /* -----------------------------
     FINAL PAYMENT SPLIT LOGIC
  ----------------------------- */

    let paidItemTotal = 0;
    let toPayItemTotal = 0;

    this.items.forEach(item => {
      const amt = Number(item.amount) || 0;
      if (item.toPay === "paid") paidItemTotal += amt;
      if (item.toPay === "toPay") toPayItemTotal += amt;
    });

    // ALL PAID
    if (paidItemTotal > 0 && toPayItemTotal === 0) {
      this.pickupCollectedAmount = this.grandTotal;
      this.deliveryPendingAmount = 0;
    }
    // ALL TO PAY
    else if (toPayItemTotal > 0 && paidItemTotal === 0) {
      this.pickupCollectedAmount = 0;
      this.deliveryPendingAmount = this.grandTotal;
    }
    // MIXED
    else {
      const totalItemAmount = paidItemTotal + toPayItemTotal;
      const paidRatio = paidItemTotal / totalItemAmount;

      this.pickupCollectedAmount = Math.round(this.grandTotal * paidRatio);
      this.deliveryPendingAmount =
        this.grandTotal - this.pickupCollectedAmount;
    }

    /* -----------------------------
   4️⃣ PAYMENT STATUS
----------------------------- */

    this.paidAmount = this.pickupCollectedAmount;

    if (this.paidAmount >= this.grandTotal) {
      this.paymentStatus = "Paid";
    } else if (this.paidAmount > 0) {
      this.paymentStatus = "Partial";
    } else {
      this.paymentStatus = "Unpaid";
    }

    /* -----------------------------
      RECEIPT NUMBER (BOOKING)
   ----------------------------- */
    if (this.isNew && this.items?.length) {

      // createdByUser MUST be ObjectId
      const user = await User.findById(this.createdByUser)
        .select("stationCode")
        .lean();

      if (!user?.stationCode) {
        throw new Error("StationCode not found for booking receipt");
      }

      const receiptNo =
        await generateAndCommitBookingReceiptNo(user.stationCode);

      // 🔥 Same receipt for all items
      this.items = this.items.map(item => ({
        ...item,
        receiptNo,
      }));
    }

    next();
  } catch (err) {
    next(err);
  }
});


const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;