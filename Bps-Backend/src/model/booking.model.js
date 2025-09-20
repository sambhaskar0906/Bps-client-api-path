import mongoose from 'mongoose';

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

    // Linked customer


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

// Auto-generate booking ID
BookingSchema.pre('validate', function (next) {
  if (!this.bookingId) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    this.bookingId = `BHPAR${randomDigits}BOOK`;
  }
  next();
});

// Calculate totals before saving
// Calculate totals before saving
BookingSchema.pre('save', function (next) {
  // Preserve billTotal from frontend if provided, otherwise calculate from items
  if ((this.billTotal === undefined || this.billTotal === null) && Array.isArray(this.items)) {
    const itemAmounts = this.items.map(item => Number(item.amount) || 0);
    this.billTotal = itemAmounts.reduce((sum, val) => sum + val, 0);
  }

  // Preserve grandTotal from frontend if provided, otherwise calculate
  if (this.grandTotal === undefined || this.grandTotal === null) {
    this.grandTotal =
      (this.billTotal || 0) +
      (Number(this.freight) || 0) +
      (Number(this.ins_vpp) || 0) +
      (Number(this.cgst) || 0) +
      (Number(this.sgst) || 0) +
      (Number(this.igst) || 0);
  }

  // Assign computed revenue (use grandTotal directly)
  this.computedTotalRevenue = this.grandTotal || 0;

  next();
});


const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;