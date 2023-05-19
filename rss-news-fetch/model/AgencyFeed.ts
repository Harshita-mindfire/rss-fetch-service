import mongoose, { Types } from "mongoose";

const AgencyFeedSchema = new mongoose.Schema({
    feedUrl: {
        type: String,
        required: [true, "Please add a url for feed"],
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

export default mongoose.model("AgencyFeed", AgencyFeedSchema);