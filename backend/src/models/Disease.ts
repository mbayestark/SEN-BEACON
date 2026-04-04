import mongoose, { Document, Schema } from 'mongoose';

export interface IDisease extends Document {
  disease_id: string;
  name: string;
  risk_factors: string[];
  data_sources: string[];
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DiseaseSchema: Schema = new Schema(
  {
    disease_id: {
      type: String,
      required: [true, 'Disease ID is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Disease name is required'],
      trim: true
    },
    risk_factors: {
      type: [String],
      default: []
    },
    data_sources: {
      type: [String],
      required: [true, 'At least one data source is required'],
      validate: {
        validator: function(sources: string[]) {
          return sources.length > 0;
        },
        message: 'At least one data source is required'
      }
    },
    icon: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

DiseaseSchema.index({ name: 1 });

export default mongoose.model<IDisease>('Disease', DiseaseSchema);
