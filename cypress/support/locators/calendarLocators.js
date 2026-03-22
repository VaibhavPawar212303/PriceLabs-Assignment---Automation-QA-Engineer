export const CalendarLocators = {
    listingRow: (listingId) => `tr:has([qa-id*="${listingId}"])`,
    listingCheckbox: (listingId) => `[qa-id="bulk-${listingId}___vrm"]`,
    dsoStatusBand: (listingId) => `[qa-id="dso-band-text-${listingId}"]`,
    saveRefreshBtn: (listingId) => `[qa-id="save-${listingId}___vrm"]`,
    listingIdText: (id) => `.pd-copy-listing-id`,
    syncToggle: (id) => `[qa-id="mc-sync-toggle-${id}"]`,
    listingEllipses: (id) => `[qa-id="listing-ellipses-${id}"]`,
    viewOverridesOption: (id) => `[qa-id="dso-view-${id}"]`,
    pricingBadge: (listingId, index) => `[qa-id="price-tooltip--${listingId}-${index}"]`,
    calendarHeaderDate: (date) => `div[qa-id="calendar-header-${date}"]`,
    basePriceInput: (id) => `[qa-id="base-price-${id}___vrm"]`,
    editOverrideBtn: (date) => `[qa-id="edit-override-view-${date}"]`,
    deleteOverrideBtn: (date) => `[qa-id="delete-override-view-${date}"]`,
    overrideRowByDate: (dateText) => `tr:contains("${dateText}")`,
    editOverrideBtn: (date) => `[qa-id="edit-override-view-${date}"]`,

    searchListingInput: '[qa-id="search-input"]',
    propertyName: '.chakra-text.css-1kh6bo9',
    modalTitle: '[qa-id="dso-modal-title"]',
    priceInput: '[qa-id="dso-price"]',
    addDsoButton: '[qa-id="add-dso-button"]',
    updateDsoButton: '[qa-id="update-dso"]',
    autoRefreshLoader: '.dso-auto-refresh-loader',
    progressBar: '[role="progressbar"]',
    priceError: '[qa-id="dso-price-error"]',
    viewModalTitle: '[qa-id="dso-view-modal-title"]',
    noDsoMessage: '[qa-id="no-dso"]',
    viewModalCloseBtn: '[qa-id="dso-view-modal-close-button"]',
    autoRefreshLoader: '.dso-auto-refresh-loader',
    modalTitle: '[qa-id="dso-modal-title"]',
    errorToast: '#chakra-toast-manager-top-left',
    toastDescription: '.chakra-alert__desc',
    warningModalTitle: '[qa-id="dso-warning-modal-title"]',
    warningGoBackBtn: '[qa-id="dso-override-confirmation-go-back-button"]',
    // ... search and pricing locators ...
    addDsoButton: '[qa-id="add-dso-button"]',
    priceInput: '[qa-id="dso-price"]',
    priceError: '[qa-id="dso-price-error"]',

    // Warning Modal (New from your HTML)
    warningModalTitle: '[qa-id="dso-warning-modal-title"]',
    warningGoBackBtn: '#bulk-dso-confirmation-go-back-button',

    // Global Components
    errorToast: '.chakra-toast [data-status="error"]',
    toastDescription: '.chakra-alert__desc',
    // --- GRID ROW LOCATORS (Dynamic Functions) ---
    listingRow: (id) => `tr:has([qa-id*="${id}"])`,
    listingBasePriceInput: (id) => `[qa-id="base-price-${id}___vrm"]`, // Function

    // --- DSO MODAL LOCATORS (Static Strings) ---
    modalBasePriceInput: '[qa-id="dso-base-price"]', // String
    modalMinPriceInput: '[qa-id="dso-min-price"]',
    modalMaxPriceInput: '[qa-id="dso-max-price"]',
    modalOverridePriceInput: '[qa-id="dso-price"]',

    // Summary Labels
    adrValue: '.css-za9x12 p.css-hbdr6j',
    totalValue: '.css-1igwmid p.css-hbdr6j',

    // Modal "Add" Buttons (Component: Buttons/Forms)
    modalAddBaseBtn: '[qa-id="add-base-price-btn"]',
    modalAddMinBtn: '[qa-id="dso-min-price-label"] + button', // Target button next to label
    modalAddMaxBtn: '[qa-id="dso-max-price-label"] + button',

    // Modal Input Fields (Strings)
    modalBasePriceInput: '[qa-id="dso-base-price"]',
    modalMinPriceInput: '[qa-id="dso-min-price"]',
    modalMaxPriceInput: '[qa-id="dso-max-price"]',
    modalOverridePriceInput: '[qa-id="dso-price"]',

    // Summary Labels
    adrValue: '.css-za9x12 p.css-hbdr6j',
    totalValue: '.css-1igwmid p.css-hbdr6j',

    // Modal Pricing Labels (To help find the generic Add buttons)
    modalMinPriceLabel: '[qa-id="dso-min-price-label"]',
    modalMaxPriceLabel: '[qa-id="dso-max-price-label"]',
    modalAddBaseBtn: '[qa-id="add-base-price-btn"]',
    modalGenericAddBtn: '[qa-id="add-value-btn"]',

    // Modal Input Fields
    modalBasePriceInput: '[qa-id="dso-base-price"]',
    modalMinPriceInput: '[qa-id="dso-min-price"]',
    modalMaxPriceInput: '[qa-id="dso-max-price"]',
    modalOverridePriceInput: '[qa-id="dso-price"]',

    // Summary Labels
    adrValue: '.css-za9x12 p.css-hbdr6j',
    totalValue: '.css-1igwmid p.css-hbdr6j',

    tooltipContainer: '[role="tooltip"]',
    pricingBadge: (listingId, index) => `[qa-id="price-tooltip--${listingId}-${index}"]`,
    // The entire popover container (handles the colon in ID)
    summaryPopover: '[id^="popover-content-"]', 
    
    // The specific price badge that triggers the popover
    pricingBadge: (listingId, index) => `[qa-id="price-tooltip--${listingId}-${index}"]`,
};