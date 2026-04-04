import mongoose, { Document, Schema } from 'mongoose';

export interface IIoTDevice extends Document {
  device_id: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  area_name: string;
  status: 'active' | 'inactive' | 'maintenance';
  last_ping?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IoTDeviceSchema: Schema = new Schema(
  {
    device_id: {
      type: String,
      required: [true, 'Device ID is required'],
      unique: true,
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
    area_name: {
      type: String,
      required: [true, 'Area name is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active'
    },
    last_ping: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

IoTDeviceSchema.index({ location: '2dsphere' });
IoTDeviceSchema.index({ area_name: 1 });
IoTDeviceSchema.index({ status: 1 });

export default mongoose.model<IIoTDevice>('IoTDevice', IoTDeviceSchema);
