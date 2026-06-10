// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vite-plus/test';
import { useSearch } from '../composables/useSearch';
import { mountWithConfig } from '../test-utils/mountWithConfig';
import SearchResults from './SearchResults.vue';

afterEach(() => {
  const { closeSearch, setQuery } = useSearch();
  closeSearch();
  setQuery('');
});

describe('SearchResults', () => {
  it('shows hint text when query is empty', () => {
    const wrapper = mountWithConfig(SearchResults);
    expect(wrapper.text()).toContain('Search across topics');
  });

  it('shows a "No matches" message when query has no results', () => {
    const { setQuery } = useSearch();
    setQuery('xyzxyzxyz_no_match');
    const wrapper = mountWithConfig(SearchResults);
    expect(wrapper.text()).toContain('No matches');
  });

  it('renders with listbox role', () => {
    const wrapper = mountWithConfig(SearchResults);
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true);
  });

  it('displays the query value in the no-matches message', () => {
    const { setQuery } = useSearch();
    setQuery('unknowntopic');
    const wrapper = mountWithConfig(SearchResults);
    expect(wrapper.text()).toContain('unknowntopic');
  });
});
