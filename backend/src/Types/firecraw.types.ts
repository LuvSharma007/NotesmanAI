interface BatchScrapeResMetadata {
    url: string,
    title:string,
    description: string,
    sourceURL: string,
    scrapeId:string,
    statusCode: 200,
}

export interface BathcScrapeRes {
    markdown:string,
    metadata:BatchScrapeResMetadata
}

export interface BathcScrapeResData {
    data:BathcScrapeRes[]
}

export interface BathcScrapeResMain {
    success: boolean,
    id: string,
    url: string,
    invalidURLs: string[]
}