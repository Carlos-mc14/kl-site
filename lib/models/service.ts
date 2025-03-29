import mongoose, { Schema, type Document } from "mongoose"

export interface IService extends Document {
  title: string
  description: string
  longDescription: string
  icon: string
  features: string[]
  displayOrder: number
  isActive: boolean
  slug: string
  createdAt: Date
  updatedAt: Date
}

const ServiceSchema = new Schema<IService>(
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
    longDescription: {
      type: String,
      required: [true, "Long description is required"],
    },
    icon: {
      type: String,
      required: [true, "Icon is required"],
      trim: true,
    },
    features: [
      {
        type: String,
        required: true,
      },
    ],
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema)

