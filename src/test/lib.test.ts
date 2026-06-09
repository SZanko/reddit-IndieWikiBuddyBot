import { describe, it, expect } from 'vitest';
import { searchForLink } from '../lib.js';

const ctx = {};

describe('searchForLink', () => {
    it('returns empty array when authorName is indie-buddy-wiki', async () => {
        const result = await searchForLink(
            'https://minecraft.fandom.com/wiki/Creeper',
            'post_1',
            'indie-buddy-wiki',
            ctx
        );
        expect(result).toEqual([]);
    });

    it('returns empty array when text has no URLs', async () => {
        const result = await searchForLink('just plain text', 'post_1', 'user', ctx);
        expect(result).toEqual([]);
    });

    it('returns empty array when URL matches no site', async () => {
        const result = await searchForLink('https://example.com/page', 'post_1', 'user', ctx);
        expect(result).toEqual([]);
    });

    it('matches a known fandom wiki URL', async () => {
        const result = await searchForLink(
            'check out https://minecraft.fandom.com/wiki/Creeper',
            'post_1',
            'user',
            ctx
        );
        expect(result).toHaveLength(1);
        expect(result[0].url).toBe('https://minecraft.fandom.com/wiki/Creeper');
        expect(result[0].site.id).toBe('en-minecraft');
        expect(result[0].origin.origin_base_url).toBe('minecraft.fandom.com');
    });

    it('does not match when path is not the wiki content path', async () => {
        const result = await searchForLink(
            'https://minecraft.fandom.com/forum/topic',
            'post_1',
            'user',
            ctx
        );
        expect(result).toEqual([]);
    });

    it('strips www. prefix when matching', async () => {
        const result = await searchForLink(
            'https://www.minecraft.fandom.com/wiki/Diamond',
            'post_1',
            'user',
            ctx
        );
        expect(result).toHaveLength(1);
        expect(result[0].site.id).toBe('en-minecraft');
    });

    it('returns multiple matches for multiple redirectable URLs', async () => {
        const result = await searchForLink(
            'see https://minecraft.fandom.com/wiki/Creeper and https://1000xresist.fandom.com/wiki/Iris',
            'post_1',
            'user',
            ctx
        );
        expect(result).toHaveLength(2);
    });

    it('ignores non-matching URLs alongside matching ones', async () => {
        const result = await searchForLink(
            'see https://minecraft.fandom.com/wiki/Creeper and https://reddit.com/r/gaming',
            'post_1',
            'user',
            ctx
        );
        expect(result).toHaveLength(1);
        expect(result[0].site.id).toBe('en-minecraft');
    });
});
