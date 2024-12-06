const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed'],
    },
    message: {
        type: String
    },
    patient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, },
    discount: Number,
    priceRuleId:Number,
    discountId: Number,
    discountCode:String, 
    items: [
        {
            id: { type: Number, required: true },
            quantity: { type: Number, default: 5 },
            price: { type: String },
            title: { type: String },
            properties: {
                capsule:{ type: String, default: '' },
                frequency: { type: String, default: '' },
                duration: { type: String, default: '' },
                takeWith: { type: String, default: '' },
                notes: { type: String, default: '' },
                message: { type: String, default: '' },
                _patient_id: { type: String, default: '' },
            },
        },
    ],
   createdAt: { type: Date, default: Date.now },
});
const Plan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
module.exports = Plan;

