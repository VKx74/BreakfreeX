
export interface Thumbnail {
    url: string;
    width: number;
    height: number;
}

export interface Project {
    id: number;
    name: string;
    hashed_id: string;
}

export interface Asset {
    url: string;
    width: number;
    height: number;
    fileSize: number;
    contentType: string;
    type: string;
}

export interface Content {
    id: number;
    name: string;
    type: string;
    created: Date;
    updated: Date;
    duration: number;
    hashed_id: string;
    description: string;
    progress: number;
    status: string;
    thumbnail: Thumbnail;
    project: Project;
    assets: Asset[];
    embedCode: string;
}

export interface Basic {
    description: string;
    duration: number;
    hashedId: string;
    name: string;
    playerDuration: string;
    type: string;
}

export interface EpisodeData {
    details: string;
    episodeNotes: string;
    publishedAt: Date;
}

export interface MediaDetails {
    basic: Basic;
    episodeData: EpisodeData;
}

export interface Medias {
    [index: string]: MediaDetails;
}

export interface MediaData {
    medias: Medias;
}
