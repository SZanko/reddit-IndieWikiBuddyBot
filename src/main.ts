import { Devvit, SettingScope } from '@devvit/public-api';

Devvit.configure({
    redditAPI: true,
    http: true,
    redis: true,
});

export default Devvit;