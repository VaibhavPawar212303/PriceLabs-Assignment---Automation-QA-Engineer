export const CalendarLocators = {
    // 1. Search Component
    searchListingInput: '[qa-id="search-input"]',
    
    // 2. Data Grid Row & Validation (Component: Data Grids)
    listingRow: (listingId) => `tr:has([qa-id*="${listingId}"])`,
    listingCheckbox: (listingId) => `[qa-id="bulk-${listingId}___vrm"]`,
    dsoStatusBand: (listingId) => `[qa-id="dso-band-text-${listingId}"]`,
    saveRefreshBtn: (listingId) => `[qa-id="save-${listingId}___vrm"]`,
    
    // 3. Dynamic Pricing Cells (The "Tooltips" Component)
    // index 4 usually represents the first visible date in the grid
    pricingBadge: (listingId, index) => `[qa-id="price-tooltip--${listingId}-${index}"]`,
    // Dynamic Date Header Selector (Component: DatePickers/Headers)
    calendarHeaderDate: (date) => '.css-26nqn0 > .mc-dso-band', 

    // 4. DSO Modal (Component: Modals)
    modalTitle: '[qa-id="dso-modal-title"]',
    priceInput: '[qa-id="dso-price"]',
    addDsoButton: '[qa-id="add-dso-button"]',
    updateDsoButton: '[qa-id="update-dso"]',
    autoRefreshLoader: '.dso-auto-refresh-loader',
    progressBar: '[role="progressbar"]',
    priceError: '[qa-id="dso-price-error"]',
    priceInput: '[qa-id="dso-price"]',
};