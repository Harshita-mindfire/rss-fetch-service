import mongoose, { Types } from "mongoose";
import Schemas from "schemas-npm-package";
import dotenv from "dotenv";
import categoryData from "./data/Category";
import agencyData from "./data/Agency";
import AgencyFeedData from "./data/AgencyFeed";
import { fetchRSSFeedAndUpdateDB } from "./utils/rss-feed";
import logger from "./logger";
import SyncStatus from "./model/SyncStatus";

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
      throw new Error("Mongo URI is undefined.");
    }
    // Connect to MongoDB
    await mongoose.connect(uri);

    await SyncStatus.deleteMany({});
    await SyncStatus.collection.insertOne({ lastSync: new Date(0) });

    // Delete existing categories
    await Schemas.Category.deleteMany({});
    const insertedCategories = await Schemas.Category.insertMany(categoryData);
    logger.info("Categories seeded successfully");

    // Delete existing agency
    await Schemas.Agency.deleteMany({});
    const insertedAgencies = await Schemas.Agency.insertMany(agencyData);
    logger.info("Agencies seeded successfully");

    const categories: Category[] = insertedCategories.map((category: any) => ({
      _id: category._id,
      title: category.title,
    }));
    const agencies: Agency[] = insertedAgencies.map((agency: any) => ({
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
    await Schemas.AgencyFeed.deleteMany({});

    const insertedData = await Schemas.AgencyFeed.insertMany(
      agencyFeedSeedData
    );
    logger.info("Agencies Feed seeded successfully");
    if (insertedData.length > 0) {
      const insertedNewsFeed = await fetchRSSFeedAndUpdateDB();
      if (insertedNewsFeed && insertedNewsFeed.length > 0) {
        logger.info("News Feed seeded successfully");
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
