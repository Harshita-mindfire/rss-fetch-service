import Parser from "rss-parser";
import Schemas from "schemas-npm-package";
import { Agencies } from "./constants";
import SyncStatus from "../model/SyncStatus";

import logger from "../logger";

enum EnclosureTags {
  MEDIA = "media:content",
  ENCLOSURE = "enclosure",
}

export const fetchRSSFeedAndUpdateDB = async () => {
  /**
   * customFields are added to get properties which are present in original
   * xml but is not returned by rss-parser by default
   */
  const parser = new Parser({
    customFields: {
      item: [[EnclosureTags.MEDIA, EnclosureTags.ENCLOSURE]],
    },
  });
  try {
    /**
     * The toiAgencyId is required for a check below. This is because The TOI feed has image
     * inside <enclosure> tag in xml whereas for HT and TH the image urls are find inside
     * <media:content> tag.
     */
    const syncStart = new Date().toISOString();
    const lastCronSync = await SyncStatus.find();
    const toiAgencyId = await Schemas.Agency.find(
      { name: Agencies.TOI },
      { _id: 1 }
    );
    const feedUrlInfo = await Schemas.AgencyFeed.find();
    const results = await Promise.all(
      feedUrlInfo.map(async (agencyData: any) => {
        const feed = await parser.parseURL(agencyData.feedUrl);
        return feed.items
          .filter(
            (item) =>
              item.pubDate && new Date(item.pubDate) > lastCronSync[0].lastSync
          )
          .map((item) => ({
            title: item.title,
            description: item.contentSnippet,
            publishedAt: item.pubDate,
            url: item.link,
            image:
              agencyData.agencyId?.toString() === toiAgencyId[0]._id.toString()
                ? item.enclosure?.url
                : item.enclosure?.$?.url,
            categoryId: agencyData.categoryId,
            agencyId: agencyData.agencyId,
          }));
      })
    );
    const newsFeed = results.flat();
    const insertedNewsFeed = await Schemas.NewsFeed.insertMany(newsFeed);
    if (insertedNewsFeed) {
      await SyncStatus.findByIdAndUpdate(lastCronSync[0]._id, {
        lastSync: syncStart,
      });
    }
    return insertedNewsFeed;
  } catch (error) {
    logger.error("Error fetching RSS feeds:", error);
  }
};
