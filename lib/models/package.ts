import mongoose, { Schema, type Document } from "mongoose"

export interface PackageFeature {
  category: string
  items: string[]
}

export interface IPackage extends Document {
  name: string
  title: string
  description: string
  price: number
  currency: string
  interval: string
  features: PackageFeature[]
  isPopular: boolean
  isActive: boolean
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

const PackageFeatureSchema = new Schema<PackageFeature>({
  category: { type: String, required: true },
  items: { type: [String], default: [] },
})

const PackageSchema = new Schema<IPackage>(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true, default: "mxn" },
    interval: { type: String, required: true, default: "mes" },
    features: { type: [PackageFeatureSchema], default: [] },
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export default mongoose.models.Package || mongoose.model<IPackage>("Package", PackageSchema)

