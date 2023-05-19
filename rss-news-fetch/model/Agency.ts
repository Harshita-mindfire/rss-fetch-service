import mongoose from "mongoose";

const AgencySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name for Agency"],
    },
    logo: {
        type: String,
        required: [true, "Please add a logo path for Agency"],
    }
})

export default mongoose.model("Agency", AgencySchema);