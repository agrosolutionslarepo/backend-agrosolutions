import mongoose from 'mongoose';

const PreciosSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  price:  { type: Number, required: true },
  ts:     { type: Date,   required: true, index: true },
}, { versionKey: false });

export default mongoose.model('Precios', PreciosSchema);
