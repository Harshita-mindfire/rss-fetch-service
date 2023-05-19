import mongoose, { Types } from "mongoose";
import CategoryModel from "./model/Category";
import categoryData from "./data/Category";
import AgencyModel from "./model/Agency";
import agencyData from "./data/Agency";
import AgencyFeedData from "./data/AgencyFeed";
import AgencyFeedModel from "./model/AgencyFeed";
import { fetchRSSFeed } from "./utils/rss-feed";
import NewsFeed from "./model/NewsFeed";

type Category = {
    _id: Types.ObjectId,
    title: string
}
type Agency = {
    _id: Types.ObjectId,
    name: string
}

type AgencyFeed = {
    feedUrl: string,
    agencyId?: Types.ObjectId,
    categoryId?: Types.ObjectId
}

const seedCategoriesAndAgencyData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect("mongodb://localhost/newsforyou");

        // Delete existing categories
        await CategoryModel.deleteMany({});
        const insertedCategories = await CategoryModel.insertMany(categoryData);
        console.log("Categories seeded successfully");

        // Delete existing agency
        await AgencyModel.deleteMany({});
        const insertedAgencies = await AgencyModel.insertMany(agencyData);
        console.log("Agencies seeded successfully");

        const categories: Category[] = insertedCategories.map(category => (
            { _id: category._id, title: category.title }
        ))
        const agencies: Agency[] = insertedAgencies.map(agency => (
            { _id: agency._id, name: agency.name }
        ))
        return { categories, agencies }

    } catch (error) {
        console.error("Error seeding categories:", error);
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
    }
};


const seedAgencyFeedandNewsFeedData = async (agencyFeedSeedData: AgencyFeed[]) => {
    try {
        // Connect to MongoDB
        await mongoose.connect("mongodb://localhost/newsforyou");

        // Delete existing agencyFeed
        await AgencyFeedModel.deleteMany({});

        const insertedData = await AgencyFeedModel.insertMany(agencyFeedSeedData);
        console.log("Agencies Feed seeded successfully");
        if (insertedData.length > 0) {
            const newsFeedData = await fetchRSSFeed();
            if (newsFeedData && newsFeedData?.length > 0) {
                await NewsFeed.insertMany(newsFeedData);
                console.log("News Feed seeded successfully");
            }
        }

    } catch (error) {
        console.error("Error seeding categories:", error);
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
    }
};

const seedData = async () => {
    const response = await seedCategoriesAndAgencyData();
    if (response) {
        const { categories, agencies } = response;
        const agencyFeedSeedData = AgencyFeedData.flatMap(entity => (
            entity.categoryData.map(data => ({
                feedUrl: data.link,
                categoryId: (categories.find(category => category.title === data.category))?._id,
                agencyId: (agencies.find(agency => agency.name === entity.agency))?._id

            }))
        ))
        await seedAgencyFeedandNewsFeedData(agencyFeedSeedData);

    }
}
seedData()