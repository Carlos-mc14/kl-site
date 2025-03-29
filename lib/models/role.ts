import mongoose, { Schema, type Document } from "mongoose"

export interface IRole extends Document {
  name: string
  description: string
  permissions: string[]
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema)

