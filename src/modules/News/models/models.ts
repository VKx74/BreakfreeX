export interface INewsMessage {
  time: number;
  title: string;
  text: string;
  link: string;
  imageSrc?: string;
}

export interface IChannel {
  items: INewsMessage[];
  title: string;
  description: string;
  link: string;
}

export interface IRSSFeed {
  id: string;
  name: string;
  link: string;
}

export interface IRSSFeedConfig {
    defaultFeed: IRSSFeed;
}

export interface IInfoModalConfig {
  type: string;
  title?: string;
  message?: string;
  newsMessages?: INewsMessage[];
  acceptCaption?: string;
}

export interface INewsPopularTag {
  tagName: string;
  count: number;
}


export interface INews {
  id?: string;
  title: string;
  description: string;
  content: string;
  tags?: string[];
  creationTime?: number;
}

export class News implements INews {
  description: string = '';
  content: string = '';
  tags: string[] = [];
  title: string = '';

  constructor(news?: INews) {
    if (news) {
      Object.keys(news).forEach(n => this[n] = news[n]);
    }
  }

}

export interface IGetNewsListResponse {
  news: INews[];
  count: number;
}

export interface INewsResponse {
  id: string;
}


