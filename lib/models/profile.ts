import mongoose, { Schema, type Document } from "mongoose"

export interface IProfile extends Document {
  userId: Schema.Types.ObjectId
  position: string
  bio: string
  image: string
  links: {
    linkedin?: string
    github?: string
    portfolio?: string
    twitter?: string
    instagram?: string
  }
  isPublic: boolean
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
    },
    bio: {
      type: String,
      required: [true, "Bio is required"],
    },
    image: {
      type: String,
      default: "/placeholder.svg",
    },
    links: {
      linkedin: String,
      github: String,
      portfolio: String,
      twitter: String,
      instagram: String,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Profile || mongoose.model<IProfile>("Profile", ProfileSchema)

