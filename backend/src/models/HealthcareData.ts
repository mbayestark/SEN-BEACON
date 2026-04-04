import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthcareData extends Document {
  facility_id: string;
  facility_name: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  area_name: string;
  current_patients: number;
  total_capacity: number;
  available_beds: number;
  disease_breakdown: {
    disease: string;
    count: number;
  }[];
  timestamp: Date;
  submitted_at: Date;
  createdAt: Date;
}

const HealthcareDataSchema: Schema = new Schema(
  {
    facility_id: {
      type: String,
      required: [true, 'Facility ID is required'],
      ref: 'HealthcareFacility'
    },
    facility_name: {
      type: String,
      required: [true, 'Facility name is required'],
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
    area_name: {
      type: String,
      required: [true, 'Area name is required'],
      trim: true
    },
    current_patients: {
      type: Number,
      required: [true, 'Current patients count is required'],
      min: [0, 'Count cannot be negative']
    },
    total_capacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: [0, 'Capacity cannot be negative']
    },
    available_beds: {
      type: Number,
      required: [true, 'Available beds is required'],
      min: [0, 'Available beds cannot be negative']
    },
    disease_breakdown: [{
      disease: {
        type: String,
        required: true
      },
      count: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      default: Date.now
    },
    submitted_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

HealthcareDataSchema.index({ facility_id: 1, timestamp: -1 });
HealthcareDataSchema.index({ location: '2dsphere' });
HealthcareDataSchema.index({ area_name: 1, timestamp: -1 });
HealthcareDataSchema.index({ timestamp: -1 });

export default mongoose.model<IHealthcareData>('HealthcareData', HealthcareDataSchema);
