import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthcareFacility extends Document {
  facility_id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'health_center';
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  contact?: string;
  total_capacity: number;
  services: string[];
  createdAt: Date;
  updatedAt: Date;
}

const HealthcareFacilitySchema: Schema = new Schema(
  {
    facility_id: {
      type: String,
      required: [true, 'Facility ID is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'health_center'],
      required: [true, 'Facility type is required']
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
        required: [true, 'Coordinates are required'],
        validate: {
          validator: function(coords: number[]) {
            return coords.length === 2 && 
                   coords[0]! >= -180 && coords[0]! <= 180 &&
                   coords[1]! >= -90 && coords[1]! <= 90;
          },
          message: 'Invalid coordinates format [longitude, latitude]'
        }
      }
    },
    contact: {
      type: String,
      trim: true
    },
    total_capacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: [0, 'Capacity cannot be negative']
    },
    services: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

HealthcareFacilitySchema.index({ location: '2dsphere' });
HealthcareFacilitySchema.index({ type: 1 });

export default mongoose.model<IHealthcareFacility>('HealthcareFacility', HealthcareFacilitySchema);
