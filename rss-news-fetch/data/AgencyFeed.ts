import { Agencies, Categories } from "../utils/constants";


type CategoryData = {
    category: string,
    link: string
}

type AgencyFeedData = {
    agency: string;
    categoryData: CategoryData[]
}

const agencyFeedData: AgencyFeedData[] = [
    {
        agency: Agencies.TOI,
        categoryData: [
            {
                category: Categories.SPORTS,
                link: "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms",
            },
            {
                category: Categories.BUSINESS,
                link: "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms",
            },
            {
                category: Categories.TOP_STORIES,
                link: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
            },
            {
                category: Categories.SCIENCE,
                link: "https://timesofindia.indiatimes.com/rssfeeds/-2128672765.cms",
            },
        ],
    },
    {
        agency: Agencies.HT,
        categoryData: [
            {
                category: Categories.SPORTS,
                link: "https://www.hindustantimes.com/feeds/rss/sports/rssfeed.xml",
            },
            {
                category: Categories.BUSINESS,
                link: "https://www.hindustantimes.com/feeds/rss/business/rssfeed.xml",
            },
            {
                category: Categories.TOP_STORIES,
                link: "https://www.hindustantimes.com/feeds/rss/top-news/rssfeed.xml",
            },
            {
                category: Categories.SCIENCE,
                link: "https://www.hindustantimes.com/feeds/rss/science/rssfeed.xml",
            },
        ],
    },
    {
        agency: Agencies.TH,
        categoryData: [
            {
                category: Categories.SPORTS,
                link: "https://www.thehindu.com/sport/feeder/default.rss",
            },
            {
                category: Categories.BUSINESS,
                link: "https://www.thehindu.com/business/feeder/default.rss",
            },
            {
                category: Categories.TOP_STORIES,
                link: "https://www.thehindu.com/feeder/default.rss",
            },
            {
                category: Categories.SCIENCE,
                link: "https://www.thehindu.com/sci-tech/science/feeder/default.rss",
            },
        ],
    },
];

export default agencyFeedData