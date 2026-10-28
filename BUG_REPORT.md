# Broken Dashboard — Bug Report

## Project Overview

**Project:** Metricly Dashboard  
**Technology:** React, Vite, JavaScript, CSS, Vitest, React Testing Library  
**Purpose:** Debug the dashboard, improve usability and accessibility, and verify fixes with automated tests.

## Bug 1: Incorrect Form Field Access

**How it was found:** Submitted the dashboard filter form and checked the browser console.

**Root cause:** The handler accessed fields using `event.target.minimum.value` and similar expressions. The form element does not reliably expose its inputs this way.

**Fix:** Added controlled React state for the search keyword, category, and minimum value.

**Verification:** The category-filter test passes and confirms that the displayed metrics update correctly.

## Bug 2: Incorrect Filter State Updates

**How it was found:** Changed filter values and applied the filters.

**Root cause:** The filter handler relied on direct DOM field access rather than maintaining form values in React state.

**Fix:** Added separate draft state for form inputs and applied the selected values through `handleFilter`.

**Verification:** Automated tests confirm that filtering works and the result count updates.

## Bug 3: Missing Minimum-Value Validation

**How it was found:** Reviewed the minimum-value field and tested invalid filter input.

**Root cause:** The original filter handler did not properly validate the minimum value before applying filters.

**Fix:** Added numeric validation, a non-negative minimum, a required field, and an accessible validation message.

**Verification:** The form includes `min="0"`, `required`, and an error message connected through `aria-describedby`.

## Bug 4: API Error Handling

**How it was found:** Simulated a rejected API request in the automated tests.

**Root cause:** Network requests can fail, and the dashboard must handle failures without leaving the user stuck on the loading state.

**Fix:** Added `try/catch/finally` handling, an error message, and a loading-state update.

**Verification:** The API failure test passes and confirms that an accessible error message appears.

## Bug 5: Accessibility Improvements

**How it was found:** Reviewed the page structure, form labels, and metric-card markup.

**Root cause:** Important interface elements need accessible names, and decorative icons should not be announced as meaningful content by screen readers.

**Fix:** Added semantic page sections, a named summary region, explicit form labels, an accessible error announcement, and `aria-hidden="true"` on decorative metric icons.

**Verification:** The interface uses semantic landmarks and labelled controls. Automated tests query elements by their accessible roles and labels.

## Bug 6: Responsive Layout

**How it was found:** Reviewed the dashboard layout and CSS media queries at desktop, tablet, and mobile widths.

**Root cause:** Dashboard grids and filter controls can become cramped or overflow on smaller screens if their column layout is not adjusted.

**Fix:** Added responsive grid layouts and media queries so metric cards and form controls adapt to narrower screens.

**Verification:** Inspect the page at desktop, tablet, and mobile widths using browser DevTools. Confirm that cards fit the viewport and controls remain usable.

## Testing Summary

The Vitest and React Testing Library suite currently contains five tests:

1. Renders metric cards after data loads.
2. Filters metrics by category.
3. Displays an error when the API request fails.
4. Displays an empty state when no metrics match.
5. Resets filters to their default values.

**Latest test result:** 5 tests passed, 0 failed.

## Testing Tools and References

- Vitest: https://vitest.dev/
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- React Developer Tools: https://react.dev/learn/react-developer-tools

## Final Verification Checklist

- [x] Dashboard renders metrics.
- [x] Filtering works.
- [x] API failure displays an error.
- [x] Empty results display a helpful message.
- [x] Reset restores the filters.
- [ ] Verify responsive behavior in browser DevTools.
- [ ] Capture a screenshot of the passing test suite.
