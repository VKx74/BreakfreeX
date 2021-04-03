import { MediaDetails } from "./dto";

export interface ContentSectors
{
    Id: string;
    Title: string;
    Name: string;
}

export interface GroupedMedia
{
    GroupName: string;
    MediaData: MediaDetails[];
}