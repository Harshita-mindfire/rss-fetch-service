import mongoose, { Types } from "mongoose";

const NewsFeedSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please add a title for news"],
    },
    description: {
        type: String,
    },
    url: {
        type: String,
        required: [true, "Please add a url for news"],
    },
    publishedAt: {
        type: Date,
        required: [true, "Please add publishing date for news"],
    },
    image: {
        type: String
    },
    clickCount: {
        type: Number,
        default: 0
    },
    categoryId: {
        type: Types.ObjectId,
        ref: "Category",
        required: true,
    },
    agencyId: {
        type: Types.ObjectId,
        ref: "Agency",
        required: "True"
    }
})

export default mongoose.model("NewsFeed", NewsFeedSchema);