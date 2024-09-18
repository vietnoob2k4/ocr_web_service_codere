const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    userRole: { type: String, enum: ["admin", "user"], default: "user" },
    subscription: {
        type: { type: String, enum: ["monthly", "per_use"], default: "per_use" },
        validUntil: Date,
        remainingUses: { type: Number, default: 3 },  // Thiết lập giá trị mặc định là 3
    },
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
