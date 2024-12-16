const mongoose = require('mongoose');

const themeTemplateSchema = new mongoose.Schema({
    doctorType: { type: String, enum: ['new', 'old'], required: true }, // Tab identifier
    title: { type: String, required: true },
    description: { type: String, required: true },
}, { timestamps: true });

// Check if the model already exists to avoid overwriting it
const ThemeTemplate = mongoose.models.ThemeTemplate || mongoose.model('ThemeTemplate', themeTemplateSchema);

module.exports = ThemeTemplate;
