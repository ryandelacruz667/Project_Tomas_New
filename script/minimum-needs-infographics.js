/**
 * Minimum Needs Infographics
 * Displays minimum needs data (food packs, water, shelter, etc.) 
 * by selected flood extent and barangays in an infographic panel
 * Shows on the right side of the screen when Minimum Needs button is clicked
 */

(function() {
    'use strict';

    var needsPanel = null;
    var isPanelActive = false;
    var currentFloodExtent = null;

    // Mapping of flood extent values to data variable names
    var floodExtentDataMap = {
        '24': 'json_24MetersAgrigationsummary_1',
        '25': 'json_25MetersAggregationSummary_4',
        '26': 'json_26MetersAggregationSummary_7',
        '27': 'json_27MetersAggregationSummary_10',
        '28': 'json_28MetersAggregationSummary_13',
        '29': 'json_29MetersAggregationSummary_16',
        '30': 'json_30MetersAggregationSummary_19'
    };

    // Minimum needs categories with icons, colors, and units
    var needsCategories = [
        {
            key: 'family_food_pack',
            label: 'Family Food Packs',
            icon: 'fa-utensils',
            color: '#FF6B6B',
            gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
            unit: 'packs',
            description: 'Essential food supplies for families'
        },
        {
            key: 'hygiene_kits',
            label: 'Hygiene Kits',
            icon: 'fa-soap',
            color: '#4ECDC4',
            gradient: 'linear-gradient(135deg, #4ECDC4 0%, #6EDDD6 100%)',
            unit: 'kits',
            description: 'Personal hygiene essentials'
        },
        {
            key: 'family_kits',
            label: 'Family Kits',
            icon: 'fa-box',
            color: '#45B7D1',
            gradient: 'linear-gradient(135deg, #45B7D1 0%, #65C7E1 100%)',
            unit: 'kits',
            description: 'Complete family assistance packages'
        },
        {
            key: 'water_kits',
            label: 'Water Kits',
            icon: 'fa-tint',
            color: '#96CEB4',
            gradient: 'linear-gradient(135deg, #96CEB4 0%, #B6EED4 100%)',
            unit: 'kits',
            description: 'Water collection and storage kits'
        },
        {
            key: 'drinking_water',
            label: 'Drinking Water',
            icon: 'fa-glass-water',
            color: '#5DADE2',
            gradient: 'linear-gradient(135deg, #5DADE2 0%, #7DCDF2 100%)',
            unit: 'liters',
            description: 'Safe drinking water supply'
        },
        {
            key: 'clean_water',
            label: 'Clean Water',
            icon: 'fa-water',
            color: '#3498DB',
            gradient: 'linear-gradient(135deg, #3498DB 0%, #54B8FB 100%)',
            unit: 'liters',
            description: 'Clean water for daily use'
        },
        {
            key: 'minimum_water_demand_for_prolonged_period',
            label: 'Water Demand',
            icon: 'fa-droplet',
            color: '#2980B9',
            gradient: 'linear-gradient(135deg, #2980B9 0%, #49A0D9 100%)',
            unit: 'liters',
            description: 'Total water requirement for extended period'
        },
        {
            key: 'shelter_space',
            label: 'Shelter Space',
            icon: 'fa-home',
            color: '#E67E22',
            gradient: 'linear-gradient(135deg, #E67E22 0%, #FF9E42 100%)',
            unit: 'spaces',
            description: 'Emergency shelter accommodations'
        },
        {
            key: 'toilet',
            label: 'Toilets',
            icon: 'fa-toilet',
            color: '#D35400',
            gradient: 'linear-gradient(135deg, #D35400 0%, #F37420 100%)',
            unit: 'units',
            description: 'Sanitation facilities'
        },
        {
            key: 'child_friendly_facilities',
            label: 'Child-Friendly Facilities',
            icon: 'fa-child',
            color: '#F39C12',
            gradient: 'linear-gradient(135deg, #F39C12 0%, #FFBC32 100%)',
            unit: 'facilities',
            description: 'Safe spaces for children'
        },
        {
            key: 'laundry_spaces',
            label: 'Laundry Spaces',
            icon: 'fa-tshirt',
            color: '#9B59B6',
            gradient: 'linear-gradient(135deg, #9B59B6 0%, #BB79D6 100%)',
            unit: 'spaces',
            description: 'Washing and laundry areas'
        },
        {
            key: 'water_spaces',
            label: 'Water Spaces',
            icon: 'fa-faucet',
            color: '#1ABC9C',
            gradient: 'linear-gradient(135deg, #1ABC9C 0%, #3ADCCC 100%)',
            unit: 'spaces',
            description: 'Water access points'
        },
        {
            key: 'health_station',
            label: 'Health Stations',
            icon: 'fa-hospital',
            color: '#E74C3C',
            gradient: 'linear-gradient(135deg, #E74C3C 0%, #FF6C5C 100%)',
            unit: 'stations',
            description: 'Medical and health facilities'
        },
        {
            key: 'couple_room',
            label: 'Couple Rooms',
            icon: 'fa-bed',
            color: '#C0392B',
            gradient: 'linear-gradient(135deg, #C0392B 0%, #E0594B 100%)',
            unit: 'rooms',
            description: 'Private accommodation for couples'
        }
    ];

    /**
     * Get selected barangay values from dropdown
     * @returns {Array} - Array of selected barangay names
     */
    function getSelectedBarangays() {
        var container = document.getElementById('barangay-checkboxes');
        if (!container) return [];
        
        var checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
        var selected = [];
        checkboxes.forEach(function(checkbox) {
            if (checkbox.value && !checkbox.disabled) {
                selected.push(checkbox.value);
            }
        });
        return selected;
    }

    /**
     * Check if Household button is active/enabled
     * @returns {boolean} - True if Household button is active
     */
    function isHouseholdButtonActive() {
        var householdNavItem = null;
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        
        navItems.forEach(function(item) {
            var span = item.querySelector('span');
            if (span && span.textContent.trim() === 'Household') {
                householdNavItem = item;
            }
        });

        if (householdNavItem) {
            return householdNavItem.classList.contains('active');
        }
        return false;
    }

    /**
     * Get flood extent data based on selected flood extent
     * @param {string} floodExtent - Flood extent value (24, 25, 26, etc.)
     * @returns {Object|null} - The GeoJSON data object or null
     */
    function getFloodExtentData(floodExtent) {
        var dataVarName = floodExtentDataMap[floodExtent];
        if (!dataVarName) {
            console.warn('No data mapping found for flood extent:', floodExtent);
            return null;
        }

        // Try to get data from global scope
        if (typeof window[dataVarName] !== 'undefined' && window[dataVarName]) {
            return window[dataVarName];
        }

        console.warn('Flood extent data not found:', dataVarName);
        return null;
    }

    /**
     * Extract minimum needs data filtered by selected barangays
     * @param {string} floodExtent - Flood extent value
     * @param {Array} selectedBarangays - Array of selected barangay names
     * @returns {Object} - Extracted minimum needs data
     */
    function extractMinimumNeedsData(floodExtent, selectedBarangays) {
        var data = getFloodExtentData(floodExtent);
        var needs = {};

        // Initialize all needs categories
        needsCategories.forEach(function(category) {
            needs[category.key] = 0;
        });

        if (!data || !data.features) {
            return needs;
        }

        // Filter features by selected barangays
        var filteredFeatures = data.features.filter(function(feature) {
            var aggregationName = feature.properties.aggregation_name;
            return aggregationName && selectedBarangays.indexOf(aggregationName) !== -1;
        });

        // Aggregate minimum needs data
        filteredFeatures.forEach(function(feature) {
            var props = feature.properties;
            
            needsCategories.forEach(function(category) {
                var propKey = 'minimum_needs__' + category.key;
                var value = props[propKey] || 0;
                needs[category.key] += parseFloat(value) || 0;
            });
        });

        return needs;
    }

    /**
     * Format number with commas
     */
    function formatNumber(num) {
        if (typeof num !== 'number') {
            num = parseFloat(num) || 0;
        }
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Create needs panel
     */
    function createNeedsPanel() {
        if (needsPanel) {
            return;
        }

        needsPanel = document.createElement('div');
        needsPanel.id = 'minimum-needs-panel';
        needsPanel.className = 'minimum-needs-panel';

        // Create panel header
        var panelHeader = document.createElement('div');
        panelHeader.className = 'minimum-needs-header';
        panelHeader.innerHTML = '<h3>Minimum Needs</h3><button class="minimum-needs-close" id="minimum-needs-close">&times;</button>';

        // Create panel content
        var panelContent = document.createElement('div');
        panelContent.className = 'minimum-needs-content';
        panelContent.id = 'minimum-needs-content';

        needsPanel.appendChild(panelHeader);
        needsPanel.appendChild(panelContent);

        document.body.appendChild(needsPanel);

        // Add close button event listener
        var closeBtn = document.getElementById('minimum-needs-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                hidePanel();
            });
        }
    }

    /**
     * Create infographic item
     * @param {Object} category - Category object with key, label, icon, color, unit
     * @param {number} value - The value to display
     * @param {number} maxValue - Maximum value for progress bar normalization
     * @returns {HTMLElement} - Infographic item element
     */
    function createInfographicItem(category, value, maxValue) {
        var item = document.createElement('div');
        item.className = 'needs-infographic-item';
        item.style.borderLeftColor = category.color;
        
        // Icon container with gradient background
        var iconContainer = document.createElement('div');
        iconContainer.className = 'needs-icon-container';
        iconContainer.style.background = category.gradient || category.color;
        iconContainer.style.borderColor = category.color;

        var icon = document.createElement('i');
        icon.className = 'fas ' + category.icon;
        icon.style.color = '#ffffff';
        iconContainer.appendChild(icon);

        // Main content area
        var content = document.createElement('div');
        content.className = 'needs-content';

        // Label with description
        var labelContainer = document.createElement('div');
        labelContainer.className = 'needs-label-container';
        
        var label = document.createElement('div');
        label.className = 'needs-label';
        label.textContent = category.label;
        label.style.color = category.color;
        
        var description = document.createElement('div');
        description.className = 'needs-description';
        description.textContent = category.description || '';
        
        labelContainer.appendChild(label);
        labelContainer.appendChild(description);

        // Value display with unit
        var valueContainer = document.createElement('div');
        valueContainer.className = 'needs-value-container';
        
        var valueDisplay = document.createElement('div');
        valueDisplay.className = 'needs-value';
        valueDisplay.textContent = formatNumber(value);
        valueDisplay.style.color = category.color;
        
        var unitDisplay = document.createElement('div');
        unitDisplay.className = 'needs-unit';
        unitDisplay.textContent = category.unit || '';
        
        valueContainer.appendChild(valueDisplay);
        valueContainer.appendChild(unitDisplay);

        // Progress bar (visual indicator)
        var progressBar = document.createElement('div');
        progressBar.className = 'needs-progress-bar';
        var progressFill = document.createElement('div');
        progressFill.className = 'needs-progress-fill';
        progressFill.style.background = category.gradient || category.color;
        // Calculate progress percentage (normalized to max value across all categories)
        var normalizedMax = maxValue || value || 100;
        var progressPercent = Math.min((value / normalizedMax) * 100, 100);
        progressFill.style.width = progressPercent + '%';
        progressBar.appendChild(progressFill);

        content.appendChild(labelContainer);
        content.appendChild(valueContainer);
        content.appendChild(progressBar);

        item.appendChild(iconContainer);
        item.appendChild(content);

        return item;
    }

    /**
     * Show panel and update infographics
     */
    function showPanel() {
        createNeedsPanel();
        
        if (!needsPanel) {
            return;
        }

        var floodExtentSelect = document.getElementById('flood-extent-select');
        if (!floodExtentSelect) {
            return;
        }

        var selectedFloodExtent = floodExtentSelect.value;
        if (!selectedFloodExtent) {
            return;
        }

        // Get selected barangays
        var selectedBarangays = getSelectedBarangays();

        var panelContent = document.getElementById('minimum-needs-content');
        if (!panelContent) {
            return;
        }

        // Clear previous content
        panelContent.innerHTML = '';

        if (selectedBarangays.length === 0) {
            var noDataMsg = document.createElement('div');
            noDataMsg.className = 'needs-no-data';
            noDataMsg.textContent = 'Please select at least one barangay from the dropdown.';
            panelContent.appendChild(noDataMsg);
            needsPanel.classList.add('active');
            return;
        }

        // Extract minimum needs data
        var needsData = extractMinimumNeedsData(selectedFloodExtent, selectedBarangays);

        // Calculate total items count and find max value for progress bar normalization
        var totalItems = 0;
        var categoriesWithData = 0;
        var maxValue = 0;
        needsCategories.forEach(function(category) {
            var value = needsData[category.key] || 0;
            if (value > 0) {
                totalItems++;
                categoriesWithData++;
                if (value > maxValue) {
                    maxValue = value;
                }
            }
        });

        // Create summary section
        if (categoriesWithData > 0) {
            var summarySection = document.createElement('div');
            summarySection.className = 'needs-summary-section';
            
            var summaryTitle = document.createElement('div');
            summaryTitle.className = 'needs-summary-title';
            summaryTitle.textContent = 'Summary';
            
            var summaryContent = document.createElement('div');
            summaryContent.className = 'needs-summary-content';
            
            var summaryItem = document.createElement('div');
            summaryItem.className = 'needs-summary-item';
            summaryItem.innerHTML = '<span class="summary-label">Categories with Needs:</span><span class="summary-value">' + categoriesWithData + '</span>';
            summaryContent.appendChild(summaryItem);
            
            var barangayItem = document.createElement('div');
            barangayItem.className = 'needs-summary-item';
            barangayItem.innerHTML = '<span class="summary-label">Selected Barangays:</span><span class="summary-value">' + selectedBarangays.length + '</span>';
            summaryContent.appendChild(barangayItem);
            
            var floodExtentInfo = document.createElement('div');
            floodExtentInfo.className = 'needs-flood-extent-info';
            floodExtentInfo.innerHTML = '<i class="fas fa-water"></i> Flood Extent: <strong>' + selectedFloodExtent + ' meters</strong>';
            
            summarySection.appendChild(summaryTitle);
            summarySection.appendChild(summaryContent);
            summarySection.appendChild(floodExtentInfo);
            
            panelContent.appendChild(summarySection);
        }

        // Create infographics grid
        var grid = document.createElement('div');
        grid.className = 'needs-infographics-grid';

        // Create infographic items for each category
        needsCategories.forEach(function(category) {
            var value = needsData[category.key] || 0;
            if (value > 0) {
                var item = createInfographicItem(category, value, maxValue);
                grid.appendChild(item);
            }
        });

        // If no needs data, show message
        if (grid.children.length === 0) {
            var noDataMsg = document.createElement('div');
            noDataMsg.className = 'needs-no-data';
            noDataMsg.innerHTML = '<i class="fas fa-info-circle" style="font-size: 48px; color: #ccc; margin-bottom: 15px; display: block;"></i>No minimum needs data available for selected barangays at <strong>' + selectedFloodExtent + ' meters</strong>.';
            panelContent.appendChild(noDataMsg);
        } else {
            panelContent.appendChild(grid);
        }

        needsPanel.classList.add('active');
        
        // Update button state
        var needsBtn = document.querySelector('.needs-btn');
        if (needsBtn) {
            needsBtn.classList.add('active');
        }
        
        currentFloodExtent = selectedFloodExtent;
        isPanelActive = true;
    }

    /**
     * Hide panel
     */
    function hidePanel() {
        if (needsPanel) {
            needsPanel.classList.remove('active');
        }
        
        // Update button state
        var needsBtn = document.querySelector('.needs-btn');
        if (needsBtn) {
            needsBtn.classList.remove('active');
        }
        
        currentFloodExtent = null;
        isPanelActive = false;
    }

    /**
     * Handle Minimum Needs button click
     */
    function handleNeedsButtonClick() {
        var floodExtentSelect = document.getElementById('flood-extent-select');
        if (!floodExtentSelect) {
            return;
        }

        var selectedFloodExtent = floodExtentSelect.value;
        var selectedBarangays = getSelectedBarangays();
        var householdActive = isHouseholdButtonActive();

        // Toggle panel
        if (isPanelActive) {
            hidePanel();
        } else {
            // Only show if flood extent, barangays are selected, AND household button is active
            if (selectedFloodExtent && selectedBarangays.length > 0 && householdActive) {
                showPanel();
            } else {
                // Show message if requirements not met
                if (!householdActive) {
                    alert('Please enable the Household button to view minimum needs.');
                } else if (!selectedFloodExtent) {
                    alert('Please select a flood extent to view minimum needs.');
                } else if (selectedBarangays.length === 0) {
                    alert('Please select at least one barangay to view minimum needs.');
                }
            }
        }
    }

    /**
     * Handle flood extent selection change
     * Only updates if panel is already active
     */
    function handleFloodExtentChange() {
        if (isPanelActive) {
            var floodExtentSelect = document.getElementById('flood-extent-select');
            if (!floodExtentSelect) {
                return;
            }

            var selectedFloodExtent = floodExtentSelect.value;
            var selectedBarangays = getSelectedBarangays();
            var householdActive = isHouseholdButtonActive();

            // Only show if all conditions are met
            if (selectedFloodExtent && selectedBarangays.length > 0 && householdActive) {
                showPanel();
            } else {
                hidePanel();
            }
        }
    }

    /**
     * Initialize minimum needs functionality
     */
    function init() {
        // Listen for Minimum Needs button click
        var needsBtn = document.querySelector('.needs-btn');
        if (needsBtn) {
            needsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleNeedsButtonClick();
            });
        }

        // Listen for flood extent selection changes
        var floodExtentSelect = document.getElementById('flood-extent-select');
        if (floodExtentSelect) {
            floodExtentSelect.addEventListener('change', function() {
                handleFloodExtentChange();
            });
        }

        // Listen for barangay selection changes
        var barangayContainer = document.getElementById('barangay-checkboxes');
        if (barangayContainer) {
            barangayContainer.addEventListener('change', function() {
                if (isPanelActive) {
                    handleFloodExtentChange();
                }
            });
        }

        // Listen for Household button state changes
        var householdNavItem = null;
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        navItems.forEach(function(item) {
            var span = item.querySelector('span');
            if (span && span.textContent.trim() === 'Household') {
                householdNavItem = item;
            }
        });

        if (householdNavItem) {
            // Monitor household button state changes
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        // If household button becomes inactive, hide panel
                        if (!isHouseholdButtonActive() && isPanelActive) {
                            hidePanel();
                        }
                    }
                });
            });

            observer.observe(householdNavItem, {
                attributes: true,
                attributeFilter: ['class']
            });
        }

        console.log('Minimum needs infographics functionality initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 500);
    }

})();

