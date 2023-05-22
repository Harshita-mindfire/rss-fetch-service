import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import CategoryModel from "./model/Category";
import categoryData from "./data/Category";
import AgencyModel from "./model/Agency";
import agencyData from "./data/Agency";
import AgencyFeedData from "./data/AgencyFeed";
import AgencyFeedModel from "./model/AgencyFeed";
import { fetchRSSFeedAndUpdateDB } from "./utils/rss-feed";
import SyncStatus from "./model/SyncStatus";
import logger from "./logger";

dotenv.config({ path: ".env" });

type Category = {
  _id: Types.ObjectId;
  title: string;
};
type Agency = {
  _id: Types.ObjectId;
  name: string;
};

type AgencyFeed = {
  feedUrl: string;
  agencyId?: Types.ObjectId;
  categoryId?: Types.ObjectId;
};

const seedCategoriesAndAgencyData = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MOngo URI is undefined.");
    }
    // Connect to MongoDB
    await mongoose.connect(uri);

    await SyncStatus.deleteMany({});
    await SyncStatus.collection.insertOne({ lastSync: new Date(0) });

    // Delete existing categories
    await CategoryModel.deleteMany({});
    const insertedCategories = await CategoryModel.insertMany(categoryData);
    logger.info("Categories seeded successfully");

    // Delete existing agency
    await AgencyModel.deleteMany({});
    const insertedAgencies = await AgencyModel.insertMany(agencyData);
    logger.info("Agencies seeded successfully");

    const categories: Category[] = insertedCategories.map((category) => ({
      _id: category._id,
      title: category.title,
    }));
    const agencies: Agency[] = insertedAgencies.map((agency) => ({
      _id: agency._id,
      name: agency.name,
    }));
    return { categories, agencies };
  } catch (error) {
    logger.error("Error seeding categories:", error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
  }
};

const seedAgencyFeedandNewsFeedData = async (
  agencyFeedSeedData: AgencyFeed[]
) => {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("Mongo URI is undefined.");
    }
    await mongoose.connect(uri);

    // Delete existing agencyFeed
    await AgencyFeedModel.deleteMany({});

    const insertedData = await AgencyFeedModel.insertMany(agencyFeedSeedData);
    logger.info("Agencies Feed seeded successfully");
    if (insertedData.length > 0) {
      const insertedNewsFeed = await fetchRSSFeedAndUpdateDB();
      if (insertedNewsFeed && insertedNewsFeed.length > 0) {
        logger.info("News Feed seeded successfully", insertedNewsFeed.length);
      }
    }
  } catch (error) {
    logger.error("Error seeding categories:", error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
  }
};

const seedData = async () => {
  const response = await seedCategoriesAndAgencyData();
  if (response) {
    const { categories, agencies } = response;
    const agencyFeedSeedData = AgencyFeedData.flatMap((entity) =>
      entity.categoryData.map((data) => ({
        feedUrl: data.link,
        categoryId: categories.find(
          (category) => category.title === data.category
        )?._id,
        agencyId: agencies.find((agency) => agency.name === entity.agency)?._id,
      }))
    );
    await seedAgencyFeedandNewsFeedData(agencyFeedSeedData);
  }
};
seedData();
