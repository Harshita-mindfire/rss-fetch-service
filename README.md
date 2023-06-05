# rss-fetch-service

RSS fetch service is a node micro-service that fetches news from rss feeds of `Times of India`, `The Hindu` and `Hindustan Times` for `Top Stories`
`Business`, `Sports` and `Science` categories. The cron job to fetch data runs every 0 hour. 

This service uses a shared model with other microservices, hosted privately via verdaccio.
