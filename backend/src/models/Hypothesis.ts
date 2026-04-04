import mongoose, { Document, Schema } from 'mongoose';

export interface IHypothesis extends Document {
  title: string;
  description: string;
  related_data_sources: string[];
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  area_name?: string;
  confidence_score: number;
  status: 'pending' | 'accepted' | 'refuted';
  evaluated_by?: mongoose.Types.ObjectId;
  evaluation_notes?: string;
  created_at: Date;
  evaluated_at?: Date;
}

const HypothesisSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    related_data_sources: {
      type: [String],
      required: [true, 'Related data sources are required'],
      validate: {
        validator: function(sources: string[]) {
          return sources.length > 0;
        },
        message: 'At least one data source is required'
      }
    },
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number]
      }
    },
    area_name: {
      type: String,
      trim: true
    },
    confidence_score: {
      type: Number,
      required: [true, 'Confidence score is required'],
      min: [0, 'Confidence score must be between 0 and 1'],
      max: [1, 'Confidence score must be between 0 and 1']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'refuted'],
      default: 'pending',
      required: true
    },
    evaluated_by: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    evaluation_notes: {
      type: String
    },
    created_at: {
      type: Date,
      default: Date.now,
      required: true
    },
    evaluated_at: {
      type: Date
    }
  },
  {
    timestamps: false
  }
);

HypothesisSchema.index({ status: 1, created_at: -1 });
HypothesisSchema.index({ location: '2dsphere' });
HypothesisSchema.index({ area_name: 1 });
HypothesisSchema.index({ confidence_score: -1 });

export default mongoose.model<IHypothesis>('Hypothesis', HypothesisSchema);
