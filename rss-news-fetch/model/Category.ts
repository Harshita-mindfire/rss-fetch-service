import mongoose, { Document } from "mongoose";

// Define the interface for the Category document
export interface CategoryDocument extends Document {
    title: string;
}

const CategorySchema = new mongoose.Schema<CategoryDocument>({
    title: {
        type: String,
        required: [true, "Please add a title for category"],
    },
})

export default mongoose.model<CategoryDocument>("Category", CategorySchema);