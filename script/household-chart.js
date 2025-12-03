/**
 * Household Doughnut Chart
 * Displays household counts by selected barangays in a doughnut chart
 * Shows at the bottom of the screen when Household button is clicked
 */

(function() {
    'use strict';

    var householdChartPanel = null;
    var householdCharts = {
        households: null,
        population: null,
        gender: null,
        ageGroups: null
    };
    var chartCanvases = {
        households: null,
        population: null,
        gender: null,
        ageGroups: null
    };
    var isChartActive = false;

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
     * Get all household features from Households_26 layer
     * @returns {Array} - Array of household features
     */
    function getAllHouseholdFeatures() {
        if (typeof json_Households_26 === 'undefined' || !json_Households_26) {
            return [];
        }

        if (!json_Households_26.features) {
            return [];
        }

        return json_Households_26.features;
    }

    /**
     * Count households by barangay
     * @param {Array} selectedBarangays - Array of selected barangay names
     * @returns {Object} - Object with barangay names as keys and counts as values
     */
    function countHouseholdsByBarangay(selectedBarangays) {
        var allFeatures = getAllHouseholdFeatures();
        var counts = {};

        // Initialize counts for selected barangays
        selectedBarangays.forEach(function(barangay) {
            counts[barangay] = 0;
        });

        // Count households for each selected barangay
        allFeatures.forEach(function(feature) {
            var properties = feature.properties;
            var barangay = properties.BARANGAY;

            if (barangay && selectedBarangays.indexOf(barangay) !== -1) {
                if (counts[barangay] !== undefined) {
                    counts[barangay]++;
                } else {
                    counts[barangay] = 1;
                }
            }
        });

        return counts;
    }

    /**
     * Calculate total population (MALE + FEMALE) by barangay
     * @param {Array} selectedBarangays - Array of selected barangay names
     * @returns {Object} - Object with barangay names as keys and population counts as values
     */
    function calculateTotalPopulationByBarangay(selectedBarangays) {
        var allFeatures = getAllHouseholdFeatures();
        var totals = {};

        // Initialize totals for selected barangays
        selectedBarangays.forEach(function(barangay) {
            totals[barangay] = 0;
        });

        // Sum MALE + FEMALE for each selected barangay
        allFeatures.forEach(function(feature) {
            var properties = feature.properties;
            var barangay = properties.BARANGAY;

            if (barangay && selectedBarangays.indexOf(barangay) !== -1) {
                var male = parseFloat(properties.MALE) || 0;
                var female = parseFloat(properties.FEMALE) || 0;
                var total = male + female;

                if (totals[barangay] !== undefined) {
                    totals[barangay] += total;
                } else {
                    totals[barangay] = total;
                }
            }
        });

        return totals;
    }

    /**
     * Calculate total male population by barangay
     * @param {Array} selectedBarangays - Array of selected barangay names
     * @returns {Object} - Object with barangay names as keys and male counts as values
     */
    function calculateMalePopulationByBarangay(selectedBarangays) {
        var allFeatures = getAllHouseholdFeatures();
        var totals = {};

        // Initialize totals for selected barangays
        selectedBarangays.forEach(function(barangay) {
            totals[barangay] = 0;
        });

        // Sum MALE for each selected barangay
        allFeatures.forEach(function(feature) {
            var properties = feature.properties;
            var barangay = properties.BARANGAY;

            if (barangay && selectedBarangays.indexOf(barangay) !== -1) {
                var male = parseFloat(properties.MALE) || 0;

                if (totals[barangay] !== undefined) {
                    totals[barangay] += male;
                } else {
                    totals[barangay] = male;
                }
            }
        });

        return totals;
    }

    /**
     * Calculate total female population by barangay
     * @param {Array} selectedBarangays - Array of selected barangay names
     * @returns {Object} - Object with barangay names as keys and female counts as values
     */
    function calculateFemalePopulationByBarangay(selectedBarangays) {
        var allFeatures = getAllHouseholdFeatures();
        var totals = {};

        // Initialize totals for selected barangays
        selectedBarangays.forEach(function(barangay) {
            totals[barangay] = 0;
        });

        // Sum FEMALE for each selected barangay
        allFeatures.forEach(function(feature) {
            var properties = feature.properties;
            var barangay = properties.BARANGAY;

            if (barangay && selectedBarangays.indexOf(barangay) !== -1) {
                var female = parseFloat(properties.FEMALE) || 0;

                if (totals[barangay] !== undefined) {
                    totals[barangay] += female;
                } else {
                    totals[barangay] = female;
                }
            }
        });

        return totals;
    }

    /**
     * Calculate age groups (INFANT, CHILD, ADULT, ELDERLY) by barangay
     * @param {Array} selectedBarangays - Array of selected barangay names
     * @returns {Object} - Object with age group names as keys and totals as values
     */
    function calculateAgeGroupsByBarangay(selectedBarangays) {
        var allFeatures = getAllHouseholdFeatures();
        var ageGroups = {
            'Infant': 0,
            'Child': 0,
            'Adult': 0,
            'Elderly': 0
        };

        // Sum age groups for selected barangays
        allFeatures.forEach(function(feature) {
            var properties = feature.properties;
            var barangay = properties.BARANGAY;

            if (barangay && selectedBarangays.indexOf(barangay) !== -1) {
                var infant = parseFloat(properties.INFANT) || 0;
                var child = parseFloat(properties.CHILD) || 0;
                var adult = parseFloat(properties.ADULT) || 0;
                var elderly = parseFloat(properties.ELDERLY) || 0;

                ageGroups['Infant'] += infant;
                ageGroups['Child'] += child;
                ageGroups['Adult'] += adult;
                ageGroups['Elderly'] += elderly;
            }
        });

        return ageGroups;
    }

    /**
     * Format number with thousand separators
     * @param {number} num - Number to format
     * @returns {string} - Formatted number string
     */
    function formatNumber(num) {
        if (typeof num !== 'number') {
            num = parseFloat(num) || 0;
        }
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Generate colors for chart segments
     * @param {number} count - Number of colors needed
     * @returns {Array} - Array of color strings
     */
    function generateColors(count) {
        var colors = [
            '#4a9eff', '#ff6b6b', '#51cf66', '#ffd43b', '#ff8787',
            '#74c0fc', '#ffa8a8', '#63e6be', '#ffc078', '#b197fc',
            '#ff922b', '#20c997', '#ff6b9d', '#69db7c', '#ffd43b'
        ];

        var result = [];
        for (var i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    }

    /**
     * Ensure chart containers exist in the panel
     */
    function ensureChartContainers() {
        var panelContent = document.getElementById('household-chart-content');
        if (!panelContent) {
            return false;
        }
        
        var chartsGrid = panelContent.querySelector('.household-charts-grid');
        if (chartsGrid) {
            return true; // Containers already exist
        }
        
        // Containers don't exist, recreate them
        chartsGrid = document.createElement('div');
        chartsGrid.className = 'household-charts-grid';

        // Households by Barangay chart
        var householdsContainer = document.createElement('div');
        householdsContainer.className = 'household-chart-item';
        householdsContainer.innerHTML = '<h4>Households by Barangay</h4>';
        chartCanvases.households = document.createElement('canvas');
        chartCanvases.households.id = 'household-chart-canvas-households';
        householdsContainer.appendChild(chartCanvases.households);
        chartsGrid.appendChild(householdsContainer);

        // Total Population chart
        var populationContainer = document.createElement('div');
        populationContainer.className = 'household-chart-item';
        populationContainer.innerHTML = '<h4>Total Population</h4>';
        chartCanvases.population = document.createElement('canvas');
        chartCanvases.population.id = 'household-chart-canvas-population';
        populationContainer.appendChild(chartCanvases.population);
        chartsGrid.appendChild(populationContainer);

        // Gender chart (Male and Female combined)
        var genderContainer = document.createElement('div');
        genderContainer.className = 'household-chart-item';
        genderContainer.innerHTML = '<h4>Male and Female</h4>';
        chartCanvases.gender = document.createElement('canvas');
        chartCanvases.gender.id = 'household-chart-canvas-gender';
        genderContainer.appendChild(chartCanvases.gender);
        chartsGrid.appendChild(genderContainer);

        // Age Groups chart
        var ageGroupsContainer = document.createElement('div');
        ageGroupsContainer.className = 'household-chart-item';
        ageGroupsContainer.innerHTML = '<h4>Age Groups</h4>';
        chartCanvases.ageGroups = document.createElement('canvas');
        chartCanvases.ageGroups.id = 'household-chart-canvas-agegroups';
        ageGroupsContainer.appendChild(chartCanvases.ageGroups);
        chartsGrid.appendChild(ageGroupsContainer);

        panelContent.appendChild(chartsGrid);
        return true;
    }

    /**
     * Create household chart panel
     */
    function createChartPanel() {
        if (householdChartPanel) {
            // Panel exists, but ensure containers exist
            ensureChartContainers();
            return; // Panel already exists
        }

        // Create panel container
        householdChartPanel = document.createElement('div');
        householdChartPanel.id = 'household-chart-panel';
        householdChartPanel.className = 'household-chart-panel';

        // Create panel header
        var panelHeader = document.createElement('div');
        panelHeader.className = 'household-chart-header';
        panelHeader.innerHTML = '<h3>Household Statistics</h3><button class="household-chart-close" id="household-chart-close">&times;</button>';

        // Create panel content with grid layout for multiple charts
        var panelContent = document.createElement('div');
        panelContent.className = 'household-chart-content';
        panelContent.id = 'household-chart-content';

        // Create chart containers
        var chartsGrid = document.createElement('div');
        chartsGrid.className = 'household-charts-grid';

        // Households by Barangay chart
        var householdsContainer = document.createElement('div');
        householdsContainer.className = 'household-chart-item';
        householdsContainer.innerHTML = '<h4>Households by Barangay</h4>';
        chartCanvases.households = document.createElement('canvas');
        chartCanvases.households.id = 'household-chart-canvas-households';
        householdsContainer.appendChild(chartCanvases.households);
        chartsGrid.appendChild(householdsContainer);

        // Total Population chart
        var populationContainer = document.createElement('div');
        populationContainer.className = 'household-chart-item';
        populationContainer.innerHTML = '<h4>Total Population</h4>';
        chartCanvases.population = document.createElement('canvas');
        chartCanvases.population.id = 'household-chart-canvas-population';
        populationContainer.appendChild(chartCanvases.population);
        chartsGrid.appendChild(populationContainer);

        // Gender chart (Male and Female combined)
        var genderContainer = document.createElement('div');
        genderContainer.className = 'household-chart-item';
        genderContainer.innerHTML = '<h4>Male and Female</h4>';
        chartCanvases.gender = document.createElement('canvas');
        chartCanvases.gender.id = 'household-chart-canvas-gender';
        genderContainer.appendChild(chartCanvases.gender);
        chartsGrid.appendChild(genderContainer);

        // Age Groups chart
        var ageGroupsContainer = document.createElement('div');
        ageGroupsContainer.className = 'household-chart-item';
        ageGroupsContainer.innerHTML = '<h4>Age Groups</h4>';
        chartCanvases.ageGroups = document.createElement('canvas');
        chartCanvases.ageGroups.id = 'household-chart-canvas-agegroups';
        ageGroupsContainer.appendChild(chartCanvases.ageGroups);
        chartsGrid.appendChild(ageGroupsContainer);

        panelContent.appendChild(chartsGrid);

        // Assemble panel
        householdChartPanel.appendChild(panelHeader);
        householdChartPanel.appendChild(panelContent);

        // Add to body
        document.body.appendChild(householdChartPanel);

        // Close button handler
        var closeBtn = document.getElementById('household-chart-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                hideChartPanel();
            });
        }
    }

    /**
     * Create or update a doughnut chart
     * @param {string} chartKey - Key for the chart (households, population, male, ageGroups)
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
        if (householdCharts[chartKey]) {
            householdCharts[chartKey].destroy();
        }

        // Create new chart
        var ctx = canvas.getContext('2d');
        householdCharts[chartKey] = new Chart(ctx, {
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
        
        if (!householdChartPanel) {
            return;
        }

        // Ensure chart containers exist
        ensureChartContainers();
        
        // Get selected barangays
        var selectedBarangays = getSelectedBarangays();

        var panelContent = document.getElementById('household-chart-content');
        
        if (selectedBarangays.length === 0) {
            if (panelContent) {
                // Show no data message without removing chart containers
                var noDataMsg = panelContent.querySelector('.household-chart-no-data');
                if (!noDataMsg) {
                    noDataMsg = document.createElement('div');
                    noDataMsg.className = 'household-chart-no-data';
                    noDataMsg.textContent = 'Please select at least one barangay from the dropdown.';
                    panelContent.insertBefore(noDataMsg, panelContent.firstChild);
                }
                noDataMsg.style.display = 'block';
                
                // Hide chart grid
                var chartsGrid = panelContent.querySelector('.household-charts-grid');
                if (chartsGrid) {
                    chartsGrid.style.display = 'none';
                }
            }
            return;
        }
        
        // Hide no data message if it exists
        if (panelContent) {
            var noDataMsg = panelContent.querySelector('.household-chart-no-data');
            if (noDataMsg) {
                noDataMsg.style.display = 'none';
            }
            
            // Show chart grid
            var chartsGrid = panelContent.querySelector('.household-charts-grid');
            if (chartsGrid) {
                chartsGrid.style.display = 'flex';
            }
        }

        // Calculate all statistics
        var householdCounts = countHouseholdsByBarangay(selectedBarangays);
        var populationCounts = calculateTotalPopulationByBarangay(selectedBarangays);
        var maleCounts = calculateMalePopulationByBarangay(selectedBarangays);
        var femaleCounts = calculateFemalePopulationByBarangay(selectedBarangays);
        var ageGroups = calculateAgeGroupsByBarangay(selectedBarangays);

        // Prepare display data
        var displayData = {};
        
        // Households by Barangay - always show individual barangays
        displayData.households = {};
        selectedBarangays.forEach(function(barangay) {
            var count = householdCounts[barangay] || 0;
            if (count > 0) {
                displayData.households[barangay] = count;
            }
        });

        // Total Population - aggregate by barangay (show individual barangays)
        displayData.population = {};
        selectedBarangays.forEach(function(barangay) {
            var count = populationCounts[barangay] || 0;
            if (count > 0) {
                displayData.population[barangay] = count;
            }
        });

        // Gender - combine male and female totals (aggregated across all selected barangays)
        var totalMale = 0;
        var totalFemale = 0;
        selectedBarangays.forEach(function(barangay) {
            totalMale += maleCounts[barangay] || 0;
            totalFemale += femaleCounts[barangay] || 0;
        });
        displayData.gender = {
            'Male': totalMale,
            'Female': totalFemale
        };

        // Age Groups - always aggregated (sum of all selected barangays)
        displayData.ageGroups = ageGroups;

        // Update all charts
        updateChart('households', displayData.households, 'Households');
        updateChart('population', displayData.population, 'Population');
        updateChart('gender', displayData.gender, 'Gender');
        updateChart('ageGroups', displayData.ageGroups, 'Age Groups');

        // Show panel
        householdChartPanel.classList.add('active');

        // Adjust main content - always add the class when showing
        var mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.add('household-chart-active');
        }

        isChartActive = true;
    }

    /**
     * Hide chart panel
     */
    function hideChartPanel() {
        if (householdChartPanel) {
            householdChartPanel.classList.remove('active');
        }

        // Destroy all charts
        Object.keys(householdCharts).forEach(function(key) {
            if (householdCharts[key]) {
                householdCharts[key].destroy();
                householdCharts[key] = null;
            }
        });

        // Adjust main content - only remove class if flood chart panel is also not active
        var mainContent = document.querySelector('.main-content');
        if (mainContent) {
            var floodChartPanel = document.getElementById('flood-chart-panel');
            var isFloodChartActive = floodChartPanel && floodChartPanel.classList.contains('active');
            
            // Only remove the class if flood chart is also not active
            if (!isFloodChartActive) {
                mainContent.classList.remove('household-chart-active');
            }
        }

        isChartActive = false;
    }

    /**
     * Handle Household button click for chart
     */
    function handleHouseholdChartClick() {
        isChartActive = !isChartActive;

        if (isChartActive) {
            showChartPanel();
        } else {
            hideChartPanel();
        }
    }

    /**
     * Initialize household chart functionality
     */
    function initialize() {
        // Wait for DOM and Chart.js to be ready
        if (typeof Chart === 'undefined') {
            setTimeout(initialize, 100);
            return;
        }

        // Find Household nav-item
        var householdNavItem = null;
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        
        navItems.forEach(function(item) {
            var span = item.querySelector('span');
            if (span && span.textContent.trim() === 'Household') {
                householdNavItem = item;
            }
        });

        if (!householdNavItem) {
            console.warn('Household nav-item not found');
            return;
        }

        // Listen for household button activation
        // Check if household is active by monitoring the button state
        var checkHouseholdActive = function() {
            var isActive = householdNavItem.classList.contains('active');
            if (isActive && !isChartActive) {
                // Household button is active, show chart
                isChartActive = true;
                showChartPanel();
            } else if (!isActive && isChartActive) {
                // Household button is inactive, hide chart
                isChartActive = false;
                hideChartPanel();
            }
        };

        // Monitor household button state changes
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    checkHouseholdActive();
                }
            });
        });

        observer.observe(householdNavItem, {
            attributes: true,
            attributeFilter: ['class']
        });

        // Initial check
        setTimeout(checkHouseholdActive, 500);

        // Listen for barangay selection changes
        document.addEventListener('change', function(e) {
            if (isChartActive && 
                e.target.type === 'checkbox' && 
                e.target.classList.contains('location-checkbox')) {
                
                // Check if it's a barangay checkbox
                var container = e.target.closest('.checkbox-container');
                if (container && container.id === 'barangay-checkboxes') {
                    // Update chart when barangay selection changes
                    setTimeout(function() {
                        showChartPanel();
                    }, 100);
                }
            }
        });

        console.log('Household chart functionality initialized');
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready, but wait for Chart.js and data to be initialized
        setTimeout(initialize, 1000);
    }
})();

