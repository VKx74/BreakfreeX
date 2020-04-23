export class TimeZoneShift {
    h: number;
    m?: number;
}

export class TimeZone {
    id: string;
    city?: string;

    timeZoneName: string;
    shift?: TimeZoneShift;
    isLocal?: boolean;
    abbreviation?: string;
}

export const TimeZones: TimeZone[] = [
    {
        id: '0',
        timeZoneName: '',
        isLocal: true
    },
    {
        id: '1',
        timeZoneName: 'UTC',
        abbreviation: 'UTC'
    },
    {
        id: '2',
        timeZoneName: 'America/New_York',
        abbreviation: 'EST',
        shift: {
            h: -5
        }
    },
    {
        id: '3',
        timeZoneName: 'Europe/Moscow',
        city: 'moscow',
        shift: {
            h: 3
        }
    }
];

export const UTCTimeZone = TimeZones.find(t => t.abbreviation === 'UTC');
export const LocalTimeZone = TimeZones.find(t => t.isLocal);