import mongoose, { Schema, type Document } from "mongoose"

export interface IProject extends Document {
  title: string
  description: string
  images: string[] // Cambiado de image a images para soportar múltiples imágenes
  category: string
  client: string
  completionDate: Date
  technologies: string[]
  link?: string
  displayOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProject>(
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
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    client: {
      type: String,
      required: [true, "Client is required"],
      trim: true,
    },
    completionDate: {
      type: Date,
      required: [true, "Completion date is required"],
    },
    link: {
      type: String,
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

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema)

