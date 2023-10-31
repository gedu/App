import _ from 'underscore';

class KeywordParser {
    constructor(keyword, queryRegex) {
        this.keyword = keyword;
        this.queryRegex = queryRegex;
        this.cachedResults = null;
    }

    parse(query) {
        const matches = [...query.matchAll(this.queryRegex)];
        const results = _.reduce(
            matches,
            (result, match) => {
                const {value} = match.groups;
                const parsedValue = value.replace(/"/g, '').trim();
                if (result[this.keyword]) {
                    result[this.keyword].push(...parsedValue.split(','));
                } else {
                    // eslint-disable-next-line no-param-reassign
                    result[this.keyword] = parsedValue.split(',');
                }
                return result;
            },
            {},
        );
        this.cachedResults = matches.length ? results : null;
        return this.cachedResults;
    }

    cleanQuery(query) {
        if (!this.cachedResults) {
            return;
        }
        return query.replace(this.queryRegex, '').trim();
    }
}

const parserFrom = new KeywordParser('from', /(?<keyword>from:)(?<value>[^\s,]+(?:,[^\s,]+)*)/g);

const parseIn = new KeywordParser('in', /(?<keyword>in:)(?<value>[^\s,]+(?:,[^\s,]+)*)/g);

const parseBefore = new KeywordParser('before', /(?<keyword>before:)(?<value>[^\s,]+(?:,[^\s,]+)*)/g);

const parseAfter = new KeywordParser('after', /(?<keyword>after:)(?<value>[^\s,]+(?:,[^\s,]+)*)/g);

const parseWorkspace = new KeywordParser('workspace', /(?<keyword>workspace)(?::(?<value>'[\w\s@.,'-]+'))/g);

const parseExactWord = new KeywordParser('exactword', /(?<value>"([^"]*)")/g);

const globalSearchs = [parseWorkspace, parserFrom, parseIn, parseBefore, parseAfter, parseExactWord];
export default globalSearchs;
