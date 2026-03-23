import { shouldResetFilters } from './search';

/**
 * NOTE: These tests are more expressive of the current behavior than definitive
 * of ideal behavior. They are written based on the current implementation of our
 * function to test whether search filters should be updated.
 *
 * This does mean that some bases might not be the ideal result, but it is
 * important to test that the most common cases are stable across any potential
 * changes to the logic of `shouldResetFilters`.
 */

describe('shouldResetFilters', () => {
  describe('Minor changes should not reset filters', () => {
    describe('Typo corrections', () => {
      it('single character typo: "cmopsci" -> "compsci"', () => {
        // Note: This has 2 character differences (transposed), may be too significant
        expect(shouldResetFilters('cmopsci', 'compsci')).toBe(true);
      });

      it('missing characters: "alx" -> "alex"', () => {
        expect(shouldResetFilters('alx', 'alex')).toBe(false);
      });

      it('extra characters: "alexxx" -> "alex"', () => {
        expect(shouldResetFilters('alexxx', 'alex')).toBe(false);
      });

      it('case changes: "CompSci" -> "compsci"', () => {
        expect(shouldResetFilters('CompSci', 'compsci')).toBe(false);
      });

      it('multiple minor typos: "cmoputer sceince" -> "computer science"', () => {
        // edge case; sometimes multiple typos may be too different, which is fine
        expect(shouldResetFilters('cmoputer sceince', 'computer science')).toBe(true);
      });
    });

    describe('Similar course searches', () => {
      it('changing course numbers: "ics 46" -> "ics 161"', () => {
        expect(shouldResetFilters('ics 46', 'ics 161')).toBe(false);
      });

      it('refining course search: "ics" -> "ics 33"', () => {
        expect(shouldResetFilters('ics', 'ics 33')).toBe(false);
      });

      it('adding course details: "compsci" -> "compsci 121"', () => {
        expect(shouldResetFilters('compsci', 'compsci 121')).toBe(false);
      });

      it('similar course codes: "inf 43" -> "inf 113"', () => {
        expect(shouldResetFilters('inf 43', 'inf 113')).toBe(false);
      });

      it('searching similar topics: "data struct" -> "data structures"', () => {
        expect(shouldResetFilters('data struct', 'data structures')).toBe(false);
      });
    });

    describe('Similar instructor searches', () => {
      it('expanding name: "bob" -> "bobby"', () => {
        expect(shouldResetFilters('bob', 'bobby')).toBe(false);
      });

      it('adding last name: "richard" -> "richard pattis"', () => {
        expect(shouldResetFilters('richard', 'richard pattis')).toBe(false);
      });

      it('partial name match: "patt" -> "pattis"', () => {
        expect(shouldResetFilters('patt', 'pattis')).toBe(false);
      });
    });

    describe('Identical or near-identical queries', () => {
      it('identical queries', () => {
        expect(shouldResetFilters('ics 46', 'ics 46')).toBe(false);
      });

      it('queries with extra whitespace', () => {
        expect(shouldResetFilters('ics  46', 'ics 46')).toBe(false);
      });

      it('queries with leading/trailing whitespace', () => {
        expect(shouldResetFilters('  ics 46  ', 'ics 46')).toBe(false);
      });
    });
  });

  describe('Major changes reset filters', () => {
    describe('Course subject changes', () => {
      it('completely different subject: "compsci" -> "art"', () => {
        expect(shouldResetFilters('compsci', 'art')).toBe(true);
      });

      it('different departments: "sociology" -> "social ecology"', () => {
        expect(shouldResetFilters('sociology', 'social ecology')).toBe(true);
      });

      it('unrelated courses: "math" -> "english"', () => {
        expect(shouldResetFilters('math', 'english')).toBe(true);
      });

      it('cross-department courses: "ics 46" -> "math 2a"', () => {
        expect(shouldResetFilters('ics 46', 'math 2a')).toBe(true);
      });

      it('different course codes: "cs" -> "informatics"', () => {
        expect(shouldResetFilters('cs', 'informatics')).toBe(true);
      });

      it('completely different topics: "algorithms" -> "poetry"', () => {
        expect(shouldResetFilters('algorithms', 'poetry')).toBe(true);
      });
    });

    describe('Topic/domain changes - instructors', () => {
      it('should reset filters for different instructor: "arthur" -> "art his"', () => {
        expect(shouldResetFilters('arthur', 'art his')).toBe(true);
      });

      it('should reset filters for completely different names: "smith" -> "johnson"', () => {
        expect(shouldResetFilters('smith', 'johnson')).toBe(true);
      });

      it('should reset filters for unrelated names: "alex" -> "bob"', () => {
        expect(shouldResetFilters('alex', 'bob')).toBe(true);
      });

      it('should reset filters when switching to different person: "richard pattis" -> "john doe"', () => {
        expect(shouldResetFilters('richard pattis', 'john doe')).toBe(true);
      });

      it('adding middle initial: "john smith" -> "john a smith"', () => {
        // Adding words in the middle changes the prefix significantly
        expect(shouldResetFilters('john smith', 'john a smith')).toBe(true);
      });

      it('name variations: "mike" -> "michael"', () => {
        // Only 57% prefix match (4/7), below 60% threshold
        expect(shouldResetFilters('mike', 'michael')).toBe(true);
      });
    });

    describe('Major structural changes', () => {
      it('should reset filters when query becomes much longer', () => {
        expect(shouldResetFilters('ics', 'introduction to software engineering')).toBe(true);
      });

      it('should reset filters when query becomes much shorter with different meaning', () => {
        expect(shouldResetFilters('introduction to computer science', 'art')).toBe(true);
      });

      it('should reset filters for completely rewritten query', () => {
        expect(shouldResetFilters('computer programming', 'visual design')).toBe(true);
      });
    });
  });

  describe('Edge cases', () => {
    describe('Empty and whitespace queries', () => {
      it('empty string to query transition', () => {
        expect(shouldResetFilters('', 'something')).toBe(true);
      });

      it('query to empty string transition', () => {
        // When new query is empty, no search happens, so don't reset
        expect(shouldResetFilters('something', '')).toBe(false);
      });

      it('both queries being empty', () => {
        // This is a potential edge case - both empty should probably not reset
        expect(shouldResetFilters('', '')).toBe(false);
      });

      it('whitespace-only queries', () => {
        expect(shouldResetFilters('   ', '  ')).toBe(false);
      });
    });

    describe('Very short queries', () => {
      it('single character changes: "a" -> "b"', () => {
        expect(shouldResetFilters('a', 'b')).toBe(true);
      });

      it('single character expansion: "a" -> "ab"', () => {
        expect(shouldResetFilters('a', 'ab')).toBe(false);
      });

      it('two character queries: "ab" -> "ac"', () => {
        expect(shouldResetFilters('ab', 'ac')).toBe(true);
      });

      it('two character to completely different: "ab" -> "xy"', () => {
        expect(shouldResetFilters('ab', 'xy')).toBe(true);
      });
    });

    describe('Very long queries', () => {
      it('should preserve filters for minor change in long query', () => {
        const query1 = 'introduction to computer science and programming fundamentals';
        const query2 = 'introduction to computer science and programming fundamental';
        expect(shouldResetFilters(query1, query2)).toBe(false);
      });

      it('should reset filters for major change in long query', () => {
        const query1 = 'introduction to computer science and programming fundamentals';
        const query2 = 'advanced topics in artificial intelligence and machine learning';
        expect(shouldResetFilters(query1, query2)).toBe(true);
      });
    });

    describe('Boundary cases for similarity threshold (0.6)', () => {
      it('should preserve filters just above threshold', () => {
        // Common prefix of 6 characters out of 10 = 0.6 exactly
        expect(shouldResetFilters('abcdefghij', 'abcdefzzzz')).toBe(false);
      });

      it('should reset filters just below threshold', () => {
        // Common prefix of 5 characters out of 10 = 0.5
        expect(shouldResetFilters('abcdexxxxx', 'abcdeyyyyyy')).toBe(true);
      });

      it('should handle threshold with different length strings', () => {
        // Common prefix of 6, max length 15 = 0.4
        expect(shouldResetFilters('abcdefghijklmno', 'abcdef')).toBe(true);
      });
    });

    describe('First token vs full query logic', () => {
      it('preserves when first token is similar but rest changes slightly', () => {
        expect(shouldResetFilters('computer science 101', 'computer science 102')).toBe(false);
      });

      it('resets when first token changes significantly even if rest is similar', () => {
        expect(shouldResetFilters('introduction programming', 'advanced programming')).toBe(true);
      });

      it('handles single word queries', () => {
        expect(shouldResetFilters('programming', 'programing')).toBe(false);
      });

      it('resets for single word to multi-word with different first token', () => {
        expect(shouldResetFilters('programming', 'advanced topics')).toBe(true);
      });
    });

    describe('Special characters and numbers', () => {
      it('handles queries with numbers', () => {
        expect(shouldResetFilters('cs 101', 'cs 102')).toBe(false);
      });

      it('handles queries with mixed alphanumeric', () => {
        expect(shouldResetFilters('ics33', 'ics46')).toBe(false);
      });

      it('preserves filters for queries with punctuation', () => {
        expect(shouldResetFilters('c++', 'c++')).toBe(false);
      });
    });
  });

  describe('Other tests', () => {
    describe('Does not reset filters for progressive refinement', () => {
      it('course search refinement', () => {
        expect(shouldResetFilters('comp', 'compsci')).toBe(false);
        expect(shouldResetFilters('compsci', 'compsci 1')).toBe(false);
        expect(shouldResetFilters('compsci 1', 'compsci 121')).toBe(false);
      });

      it('instructor search refinement', () => {
        expect(shouldResetFilters('pat', 'patt')).toBe(false);
        expect(shouldResetFilters('patt', 'pattis')).toBe(false);
        // Note: This case may reset due to lower prefix similarity
        expect(shouldResetFilters('pattis', 'richard pattis')).toBe(true);
      });
    });

    describe('Topic switches reset filters', () => {
      it('switching from one course to completely different', () => {
        expect(shouldResetFilters('ics 46 data structures', 'art 1a drawing')).toBe(true);
      });

      it('switching instructors', () => {
        // First token is same, but overall prefix is different enough
        // "professor s" vs "professor j" = 11/16 = 68% on shorter, but smith vs jones is different
        // Actually preserves because first token "professor" is same
        expect(shouldResetFilters('professor smith', 'professor jones')).toBe(false);
      });

      it('switching between course and instructor search', () => {
        expect(shouldResetFilters('ics 46', 'pattis')).toBe(true);
      });
    });
  });
});
