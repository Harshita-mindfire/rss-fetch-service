import mongoose from "mongoose";

const SyncStatusSchema = new mongoose.Schema({
  lastSync: {
    type: Date,
    required: true,
  },
});

export default mongoose.model("SyncStatus", SyncStatusSchema);
