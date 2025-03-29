import mongoose, { Schema, type Document } from "mongoose"

export interface IFeature extends Document {
  title: string
  description: string
  icon: string
  displayOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const FeatureSchema = new Schema<IFeature>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    icon: {
      type: String,
      required: [true, "Icon is required"],
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Feature || mongoose.model<IFeature>("Feature", FeatureSchema)

