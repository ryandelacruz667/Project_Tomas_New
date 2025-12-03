/**
 * Flood Extent Doughnut Chart
 * Displays flood extent data (affected population, age groups, gender, displaced) 
 * by selected barangays in doughnut charts
 * Shows at the bottom of the screen when a flood extent is selected
 */

(function() {
    'use strict';

    var floodChartPanel = null;
    var floodCharts = {
        totalAffected: null,
        ageGroups: null,
        gender: null,
        displaced: null,
        displacedGender: null
    };
    var chartCanvases = {
        totalAffected: null,
        ageGroups: null,
        gender: null,
        displaced: null,
        displacedGender: null
    };
    var isChartActive = false;
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
     * Extract flood extent data filtered by selected barangays
     * @param {string} floodExtent - Flood extent value
     * @param {Array} selectedBarangays - Array of selected barangay names
     * @returns {Object} - Extracted data object
     */
    function extractFloodExtentData(floodExtent, selectedBarangays) {
        var data = getFloodExtentData(floodExtent);
        var extracted = {
            totalAffected: {},
            ageGroups: {
                'Infant': 0,
                'Child': 0,
                'Adult': 0,
                'Elderly': 0
            },
            gender: {
                'Male': 0,
                'Female': 0
            },
            displaced: {},
            displacedGender: {
                'Male': 0,
                'Female': 0
            }
        };

        if (!data || !data.features) {
            return extracted;
        }

        // Filter features by selected barangays
        var filteredFeatures = data.features.filter(function(feature) {
            var aggregationName = feature.properties.aggregation_name;
            return aggregationName && selectedBarangays.indexOf(aggregationName) !== -1;
        });

        // Aggregate data
        filteredFeatures.forEach(function(feature) {
            var props = feature.properties;
            var barangay = props.aggregation_name || 'Unknown';

            // Total affected by barangay
            var totalAffected = props.total_affected || props.population_affected || 0;
            if (totalAffected > 0) {
                extracted.totalAffected[barangay] = (extracted.totalAffected[barangay] || 0) + totalAffected;
            }

            // Age groups
            extracted.ageGroups['Infant'] += props.infant || 0;
            extracted.ageGroups['Child'] += props.child || 0;
            extracted.ageGroups['Adult'] += props.adult || 0;
            extracted.ageGroups['Elderly'] += props.elderly || 0;

            // Gender
            extracted.gender['Male'] += props.male || 0;
            extracted.gender['Female'] += props.female || 0;

            // Displaced by barangay
            var displaced = props.displaced || 0;
            if (displaced > 0) {
                extracted.displaced[barangay] = (extracted.displaced[barangay] || 0) + displaced;
            }

            // Displaced gender
            extracted.displacedGender['Male'] += props.male_displaced || 0;
            extracted.displacedGender['Female'] += props.female_displaced || 0;
        });

        return extracted;
    }

    /**
     * Format number with commas
     */
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Generate colors for chart segments
     */
    function generateColors(count) {
        var colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
            '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
        ];
        var result = [];
        for (var i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    }

    /**
     * Create flood chart panel
     */
    function createChartPanel() {
        if (floodChartPanel) {
            return;
        }

        floodChartPanel = document.createElement('div');
        floodChartPanel.id = 'flood-chart-panel';
        floodChartPanel.className = 'household-chart-panel';

        // Create panel header
        var panelHeader = document.createElement('div');
        panelHeader.className = 'household-chart-header';
        panelHeader.innerHTML = '<h3>Flood Extent Statistics</h3><button class="household-chart-close" id="flood-chart-close">&times;</button>';

        // Create panel content with grid layout for multiple charts
        var panelContent = document.createElement('div');
        panelContent.className = 'household-chart-content';
        panelContent.id = 'flood-chart-content';

        // Create chart containers
        var chartsGrid = document.createElement('div');
        chartsGrid.className = 'household-charts-grid';

        // Total Affected Population chart
        var totalAffectedContainer = document.createElement('div');
        totalAffectedContainer.className = 'household-chart-item';
        totalAffectedContainer.innerHTML = '<h4>Total Affected Population</h4>';
        chartCanvases.totalAffected = document.createElement('canvas');
        chartCanvases.totalAffected.id = 'flood-chart-canvas-total-affected';
        totalAffectedContainer.appendChild(chartCanvases.totalAffected);
        chartsGrid.appendChild(totalAffectedContainer);

        // Age Groups chart
        var ageGroupsContainer = document.createElement('div');
        ageGroupsContainer.className = 'household-chart-item';
        ageGroupsContainer.innerHTML = '<h4>Age Groups</h4>';
        chartCanvases.ageGroups = document.createElement('canvas');
        chartCanvases.ageGroups.id = 'flood-chart-canvas-agegroups';
        ageGroupsContainer.appendChild(chartCanvases.ageGroups);
        chartsGrid.appendChild(ageGroupsContainer);

        // Gender chart
        var genderContainer = document.createElement('div');
        genderContainer.className = 'household-chart-item';
        genderContainer.innerHTML = '<h4>Gender</h4>';
        chartCanvases.gender = document.createElement('canvas');
        chartCanvases.gender.id = 'flood-chart-canvas-gender';
        genderContainer.appendChild(chartCanvases.gender);
        chartsGrid.appendChild(genderContainer);

        // Displaced chart
        var displacedContainer = document.createElement('div');
        displacedContainer.className = 'household-chart-item';
        displacedContainer.innerHTML = '<h4>Displaced Population</h4>';
        chartCanvases.displaced = document.createElement('canvas');
        chartCanvases.displaced.id = 'flood-chart-canvas-displaced';
        displacedContainer.appendChild(chartCanvases.displaced);
        chartsGrid.appendChild(displacedContainer);

        // Displaced Gender chart
        var displacedGenderContainer = document.createElement('div');
        displacedGenderContainer.className = 'household-chart-item';
        displacedGenderContainer.innerHTML = '<h4>Displaced Gender</h4>';
        chartCanvases.displacedGender = document.createElement('canvas');
        chartCanvases.displacedGender.id = 'flood-chart-canvas-displaced-gender';
        displacedGenderContainer.appendChild(chartCanvases.displacedGender);
        chartsGrid.appendChild(displacedGenderContainer);

        panelContent.appendChild(chartsGrid);

        floodChartPanel.appendChild(panelHeader);
        floodChartPanel.appendChild(panelContent);

        document.body.appendChild(floodChartPanel);

        // Add close button event listener
        var closeBtn = document.getElementById('flood-chart-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                hideChartPanel();
            });
        }
    }

    /**
     * Create or update a doughnut chart
     * @param {string} chartKey - Key for the chart
     * @param {Object} dataObj - Object with labels as keys and values as counts
     * @param {string} labelPrefix - Prefix for tooltip labels
     */
    function updateChart(chartKey, dataObj, labelPrefix) {
        var canvas = chartCanvases[chartKey];
        if (!canvas) {
            console.warn('Chart canvas not found for:', chartKey);
            return;
        }

        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js library is not loaded');
            return;
        }

        // Prepare data for chart
        var labels = [];
        var data = [];

        Object.keys(dataObj).forEach(function(key) {
            var value = dataObj[key];
            if (value > 0) {
                labels.push(key);
                data.push(value);
            }
        });

        // If no data, don't create chart
        if (labels.length === 0 || data.length === 0) {
            return;
        }

        // Generate colors
        var colors = generateColors(labels.length);
        var backgroundColors = colors;
        var borderColors = colors;

        // Destroy existing chart if it exists
        if (floodCharts[chartKey]) {
            floodCharts[chartKey].destroy();
        }

        // Create new chart
        var ctx = canvas.getContext('2d');
        floodCharts[chartKey] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: labelPrefix,
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 4,
                            font: {
                                size: 8,
                                weight: '500'
                            },
                            generateLabels: function(chart) {
                                var data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map(function(label, i) {
                                        var dataset = data.datasets[0];
                                        var value = dataset.data[i];
                                        
                                        return {
                                            text: label + ' (' + formatNumber(value) + ')',
                                            fillStyle: dataset.backgroundColor[i],
                                            strokeStyle: dataset.borderColor[i],
                                            lineWidth: dataset.borderWidth,
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                var label = context.label || '';
                                var value = context.parsed || 0;
                                return label + ': ' + formatNumber(value);
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Show chart panel and update all charts
     */
    function showChartPanel() {
        createChartPanel();
        
        if (!floodChartPanel) {
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

        if (selectedBarangays.length === 0) {
            var panelContent = document.getElementById('flood-chart-content');
            if (panelContent) {
                panelContent.innerHTML = '<div class="household-chart-no-data">Please select at least one barangay from the dropdown.</div>';
            }
            floodChartPanel.classList.add('active');
            return;
        }

        // Extract data
        var extractedData = extractFloodExtentData(selectedFloodExtent, selectedBarangays);

        // Update all charts
        updateChart('totalAffected', extractedData.totalAffected, 'Total Affected');
        updateChart('ageGroups', extractedData.ageGroups, 'Age Groups');
        updateChart('gender', extractedData.gender, 'Gender');
        updateChart('displaced', extractedData.displaced, 'Displaced');
        updateChart('displacedGender', extractedData.displacedGender, 'Displaced Gender');

        floodChartPanel.classList.add('active');

        // Adjust main content
        var mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.add('household-chart-active');
        }

        // Update button state
        var impactBtn = document.querySelector('.impact-btn');
        if (impactBtn) {
            impactBtn.classList.add('active');
        }

        currentFloodExtent = selectedFloodExtent;
        isChartActive = true;
    }

    /**
     * Hide chart panel
     */
    function hideChartPanel() {
        if (floodChartPanel) {
            floodChartPanel.classList.remove('active');
        }

        // Destroy all charts
        Object.keys(floodCharts).forEach(function(key) {
            if (floodCharts[key]) {
                floodCharts[key].destroy();
                floodCharts[key] = null;
            }
        });

        // Adjust main content - only remove class if household chart panel is also not active
        var mainContent = document.querySelector('.main-content');
        if (mainContent) {
            var householdChartPanel = document.getElementById('household-chart-panel');
            var isHouseholdChartActive = householdChartPanel && householdChartPanel.classList.contains('active');
            
            // Only remove the class if household chart is also not active
            if (!isHouseholdChartActive) {
                mainContent.classList.remove('household-chart-active');
            }
        }

        // Update button state
        var impactBtn = document.querySelector('.impact-btn');
        if (impactBtn) {
            impactBtn.classList.remove('active');
        }

        currentFloodExtent = null;
        isChartActive = false;
    }

    /**
     * Handle flood extent selection change
     * Only updates charts if panel is already active
     */
    function handleFloodExtentChange() {
        if (isChartActive) {
            var floodExtentSelect = document.getElementById('flood-extent-select');
            if (!floodExtentSelect) {
                return;
            }

            var selectedFloodExtent = floodExtentSelect.value;
            var selectedBarangays = getSelectedBarangays();
            var householdActive = isHouseholdButtonActive();

            // Only show if all conditions are met: flood extent, barangays, and household button active
            if (selectedFloodExtent && selectedBarangays.length > 0 && householdActive) {
                showChartPanel();
            } else {
                hideChartPanel();
            }
        } else {
            // If panel is not active but flood extent/barangays are deselected, ensure panel stays hidden
            var floodExtentSelect = document.getElementById('flood-extent-select');
            if (floodExtentSelect && !floodExtentSelect.value) {
                hideChartPanel();
            }
        }
    }

    /**
     * Handle Impact Report button click
     */
    function handleImpactButtonClick() {
        var floodExtentSelect = document.getElementById('flood-extent-select');
        if (!floodExtentSelect) {
            return;
        }

        var selectedFloodExtent = floodExtentSelect.value;
        var selectedBarangays = getSelectedBarangays();
        var householdActive = isHouseholdButtonActive();

        // Toggle chart panel
        if (isChartActive) {
            hideChartPanel();
        } else {
            // Only show if flood extent, barangays are selected, AND household button is active
            if (selectedFloodExtent && selectedBarangays.length > 0 && householdActive) {
                showChartPanel();
            } else {
                // Show message if requirements not met
                if (!householdActive) {
                    alert('Please enable the Household button to view flood impact statistics.');
                } else if (!selectedFloodExtent) {
                    alert('Please select a flood extent to view impact statistics.');
                } else if (selectedBarangays.length === 0) {
                    alert('Please select at least one barangay to view impact statistics.');
                }
            }
        }
    }

    /**
     * Initialize flood extent chart functionality
     */
    function init() {
        // Wait for DOM and Chart.js to be ready
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded, retrying...');
            setTimeout(init, 100);
            return;
        }

        // Listen for Impact Report button click
        var impactBtn = document.querySelector('.impact-btn');
        if (impactBtn) {
            impactBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleImpactButtonClick();
            });
        }

        // Listen for flood extent selection changes (only update if panel is active)
        var floodExtentSelect = document.getElementById('flood-extent-select');
        if (floodExtentSelect) {
            floodExtentSelect.addEventListener('change', function() {
                handleFloodExtentChange();
            });
        }

        // Listen for barangay selection changes (only update if panel is active)
        var barangayContainer = document.getElementById('barangay-checkboxes');
        if (barangayContainer) {
            barangayContainer.addEventListener('change', function() {
                if (isChartActive) {
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
                        // If household button becomes inactive, hide flood chart panel
                        if (!isHouseholdButtonActive() && isChartActive) {
                            hideChartPanel();
                        }
                    }
                });
            });

            observer.observe(householdNavItem, {
                attributes: true,
                attributeFilter: ['class']
            });
        }

        console.log('Flood extent chart functionality initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already ready, but wait for Chart.js and data to be initialized
        setTimeout(init, 500);
    }

})();

