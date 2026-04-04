import mongoose, { Document, Schema } from 'mongoose';

export interface IWeatherData extends Document {
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  area_name?: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  timestamp: Date;
  createdAt: Date;
}

const WeatherDataSchema: Schema = new Schema(
  {
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
      trim: true
    },
    temperature: {
      type: Number,
      required: [true, 'Temperature is required']
    },
    humidity: {
      type: Number,
      required: [true, 'Humidity is required'],
      min: [0, 'Humidity cannot be negative'],
      max: [100, 'Humidity cannot exceed 100%']
    },
    rainfall: {
      type: Number,
      required: [true, 'Rainfall is required'],
      min: [0, 'Rainfall cannot be negative']
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      default: Date.now
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

WeatherDataSchema.index({ location: '2dsphere' });
WeatherDataSchema.index({ timestamp: -1 });
WeatherDataSchema.index({ area_name: 1, timestamp: -1 });

export default mongoose.model<IWeatherData>('WeatherData', WeatherDataSchema);
