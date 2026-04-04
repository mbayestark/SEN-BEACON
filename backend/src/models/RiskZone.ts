import mongoose, { Document, Schema } from 'mongoose';

export interface IRiskZone extends Document {
  area_name: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  disease_id: string;
  risk_level: 'low' | 'medium' | 'high';
  factors: {
    factor: string;
    value: number;
    weight: number;
  }[];
  last_updated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RiskZoneSchema: Schema = new Schema(
  {
    area_name: {
      type: String,
      required: [true, 'Area name is required'],
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates are required']
      }
    },
    disease_id: {
      type: String,
      required: [true, 'Disease ID is required'],
      ref: 'Disease'
    },
    risk_level: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: [true, 'Risk level is required']
    },
    factors: [{
      factor: {
        type: String,
        required: true
      },
      value: {
        type: Number,
        required: true
      },
      weight: {
        type: Number,
        required: true,
        min: 0,
        max: 1
      }
    }],
    last_updated: {
      type: Date,
      default: Date.now,
      required: true
    }
  },
  {
    timestamps: true
  }
);

RiskZoneSchema.index({ area_name: 1, disease_id: 1 }, { unique: true });
RiskZoneSchema.index({ location: '2dsphere' });
RiskZoneSchema.index({ disease_id: 1, risk_level: 1 });
RiskZoneSchema.index({ last_updated: -1 });

export default mongoose.model<IRiskZone>('RiskZone', RiskZoneSchema);
