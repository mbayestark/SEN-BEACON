import mongoose, { Document, Schema } from 'mongoose';

export interface IMosquitoData extends Document {
  device_id: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  mosquito_breakdown: {
    mosquito_type: string;
    count: number;
  }[];
  total_count: number;
  timestamp: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const MosquitoDataSchema: Schema = new Schema(
  {
    device_id: {
      type: String,
      required: [true, 'Device ID is required'],
      ref: 'IoTDevice'
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
    mosquito_breakdown: [{
      mosquito_type: {
        type: String,
        required: [true, 'Mosquito type is required'],
        trim: true
      },
      count: {
        type: Number,
        required: [true, 'Count is required'],
        min: [0, 'Count cannot be negative']
      }
    }],
    total_count: {
      type: Number,
      required: [true, 'Total count is required'],
      min: [0, 'Total count cannot be negative']
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      default: Date.now
    },
    metadata: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

MosquitoDataSchema.index({ device_id: 1, timestamp: -1 });
MosquitoDataSchema.index({ location: '2dsphere' });
MosquitoDataSchema.index({ timestamp: -1 });
MosquitoDataSchema.index({ 'mosquito_breakdown.mosquito_type': 1, timestamp: -1 });
MosquitoDataSchema.index({ total_count: -1 });

export default mongoose.model<IMosquitoData>('MosquitoData', MosquitoDataSchema);
