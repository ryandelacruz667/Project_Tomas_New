/**
 * Municipality Flood Impact Chart
 * Displays flood impact data (hazard counts) for the whole municipality
 * from the AnalysisSummary files (24MetersAnalysisSummary_0, etc.)
 * Shows a chart with low_hazard_count, medium_hazard_count, high_hazard_count, use_caution_hazard_count
 */

(function() {
    'use strict';

    var municipalityChartPanel = null;
    var municipalityCharts = {
        hazardCounts: null,
        totalAffected: null,
        totalExposed: null,
        ageGroups: null,
        displaced: null
    };
    var chartCanvases = {
        hazardCounts: null,
        totalAffected: null,
        totalExposed: null,
        ageGroups: null,
        displaced: null
    };
    var isChartActive = false;
    var currentFloodExtent = null;

    // Mapping of flood extent values to AnalysisSummary data variable names
    var floodExtentAnalysisSummaryMap = {
        '24': 'json_24MetersAnalysisSummary_0',
        '25': 'json_25MetersAnalysisSummary_3',
        '26': 'json_26MetersAnalysisSummary_6',
        '27': 'json_27MetersAnalysisSummary_9',
        '28': 'json_28MetersAnalysisSummary_12',
        '29': 'json_29MetersAnalysisSummary_15',
        '30': 'json_30MetersAnalysisSummary_18'
    };

    /**
     * Get selected municipality values from dropdown
     * @returns {Array} - Array of selected municipality names
     */
    function getSelectedMunicipalities() {
        var container = document.getElementById('municipality-checkboxes');
        if (!container) return [];
        
        var checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
        var selected = [];
        checkboxes.forEach(function(checkbox) {
            if (checkbox.value) {
                selected.push(checkbox.value);
            }
        });
        return selected;
    }

    /**
     * Get flood extent analysis summary data based on selected flood extent
     * @param {string} floodExtent - Flood extent value (24, 25, 26, etc.)
     * @returns {Object|null} - The GeoJSON data object or null
     */
    function getAnalysisSummaryData(floodExtent) {
        var dataVarName = floodExtentAnalysisSummaryMap[floodExtent];
        if (!dataVarName) {
            console.warn('No AnalysisSummary data mapping found for flood extent:', floodExtent);
            return null;
        }

        // Try to get data from global scope
        if (typeof window[dataVarName] !== 'undefined' && window[dataVarName]) {
            return window[dataVarName];
        }

        console.warn('AnalysisSummary data not found:', dataVarName);
        return null;
    }

    /**
     * Extract all flood impact data from AnalysisSummary data
     * @param {string} floodExtent - Flood extent value
     * @returns {Object} - Extracted data with all fields
     */
    function extractAllData(floodExtent) {
        var data = getAnalysisSummaryData(floodExtent);
        var extracted = {
            hazardCounts: {},
            totalAffected: {},
            totalExposed: {},
            ageGroups: {
                'Infant': 0,
                'Child': 0,
                'Adult': 0,
                'Elderly': 0
            },
            displaced: {}
        };

        if (!data || !data.features || data.features.length === 0) {
            return extracted;
        }

        // AnalysisSummary files typically have one feature representing the whole municipality
        var feature = data.features[0];
        if (!feature || !feature.properties) {
            return extracted;
        }

        var props = feature.properties;
        
        // Extract hazard counts with proper labels
        if (props.low_hazard_count > 0) {
            extracted.hazardCounts['Low Hazard'] = props.low_hazard_count || 0;
        }
        if (props.medium_hazard_count > 0) {
            extracted.hazardCounts['Medium Hazard'] = props.medium_hazard_count || 0;
        }
        if (props.high_hazard_count > 0) {
            extracted.hazardCounts['High Hazard'] = props.high_hazard_count || 0;
        }
        if (props.use_caution_hazard_count > 0) {
            extracted.hazardCounts['Use Caution'] = props.use_caution_hazard_count || 0;
        }

        // Extract total affected and not affected
        var totalAffected = props.total_affected || 0;
        var totalNotAffected = props.total_not_affected || 0;
        if (totalAffected > 0 || totalNotAffected > 0) {
            extracted.totalAffected['Affected'] = totalAffected;
            extracted.totalAffected['Not Affected'] = totalNotAffected;
        }

        // Extract total exposed and not exposed
        var totalExposed = props.total_exposed || 0;
        var totalNotExposed = props.total_not_exposed || 0;
        if (totalExposed > 0 || totalNotExposed > 0) {
            extracted.totalExposed['Exposed'] = totalExposed;
            extracted.totalExposed['Not Exposed'] = totalNotExposed;
        }

        // Extract age groups
        extracted.ageGroups['Infant'] = props.infant || 0;
        extracted.ageGroups['Child'] = props.child || 0;
        extracted.ageGroups['Adult'] = props.adult || 0;
        extracted.ageGroups['Elderly'] = props.elderly || 0;

        // Extract displaced
        var displaced = props.displaced || 0;
        if (displaced > 0) {
            extracted.displaced['Displaced'] = displaced;
        }

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
     * Create municipality flood impact chart panel
     */
    function createChartPanel() {
        if (municipalityChartPanel) {
            return;
        }

        municipalityChartPanel = document.createElement('div');
        municipalityChartPanel.id = 'municipality-flood-impact-chart-panel';
        municipalityChartPanel.className = 'household-chart-panel';

        // Create panel header
        var panelHeader = document.createElement('div');
        panelHeader.className = 'household-chart-header';
        panelHeader.innerHTML = '<h3 id="municipality-flood-impact-title">Municipality Flood Impact</h3><button class="household-chart-close" id="municipality-flood-impact-chart-close">&times;</button>';

        // Create panel content with grid layout for multiple charts
        var panelContent = document.createElement('div');
        panelContent.className = 'household-chart-content';
        panelContent.id = 'municipality-flood-impact-chart-content';

        // Create chart containers
        var chartsGrid = document.createElement('div');
        chartsGrid.className = 'household-charts-grid';

        // Hazard Counts chart
        var hazardCountsContainer = document.createElement('div');
        hazardCountsContainer.className = 'household-chart-item';
        hazardCountsContainer.innerHTML = '<h4>Exposure Level</h4>';
        chartCanvases.hazardCounts = document.createElement('canvas');
        chartCanvases.hazardCounts.id = 'municipality-chart-canvas-hazard-counts';
        hazardCountsContainer.appendChild(chartCanvases.hazardCounts);
        chartsGrid.appendChild(hazardCountsContainer);

        // Total Affected chart
        var totalAffectedContainer = document.createElement('div');
        totalAffectedContainer.className = 'household-chart-item';
        totalAffectedContainer.innerHTML = '<h4>Total Affected vs Not Affected Population</h4>';
        chartCanvases.totalAffected = document.createElement('canvas');
        chartCanvases.totalAffected.id = 'municipality-chart-canvas-total-affected';
        totalAffectedContainer.appendChild(chartCanvases.totalAffected);
        chartsGrid.appendChild(totalAffectedContainer);

        // Total Exposed chart
        var totalExposedContainer = document.createElement('div');
        totalExposedContainer.className = 'household-chart-item';
        totalExposedContainer.innerHTML = '<h4>Total Exposed Population</h4>';
        chartCanvases.totalExposed = document.createElement('canvas');
        chartCanvases.totalExposed.id = 'municipality-chart-canvas-total-exposed';
        totalExposedContainer.appendChild(chartCanvases.totalExposed);
        chartsGrid.appendChild(totalExposedContainer);

        // Age Groups chart
        var ageGroupsContainer = document.createElement('div');
        ageGroupsContainer.className = 'household-chart-item';
        ageGroupsContainer.innerHTML = '<h4>Age Groups</h4>';
        chartCanvases.ageGroups = document.createElement('canvas');
        chartCanvases.ageGroups.id = 'municipality-chart-canvas-agegroups';
        ageGroupsContainer.appendChild(chartCanvases.ageGroups);
        chartsGrid.appendChild(ageGroupsContainer);

        // Displaced chart
        var displacedContainer = document.createElement('div');
        displacedContainer.className = 'household-chart-item';
        displacedContainer.innerHTML = '<h4>Displaced Population</h4>';
        chartCanvases.displaced = document.createElement('canvas');
        chartCanvases.displaced.id = 'municipality-chart-canvas-displaced';
        displacedContainer.appendChild(chartCanvases.displaced);
        chartsGrid.appendChild(displacedContainer);

        panelContent.appendChild(chartsGrid);

        municipalityChartPanel.appendChild(panelHeader);
        municipalityChartPanel.appendChild(panelContent);

        document.body.appendChild(municipalityChartPanel);

        // Add close button event listener
        var closeBtn = document.getElementById('municipality-flood-impact-chart-close');
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

        // Generate colors - use specific colors for hazard counts
        var colors = [];
        if (chartKey === 'hazardCounts') {
            labels.forEach(function(label) {
                if (label === 'Low Hazard') colors.push('#4CAF50');
                else if (label === 'Medium Hazard') colors.push('#FFC107');
                else if (label === 'High Hazard') colors.push('#FF9800');
                else if (label === 'Use Caution') colors.push('#F44336');
                else colors.push('#36A2EB');
            });
        } else {
            colors = generateColors(labels.length);
        }

        var backgroundColors = colors;
        var borderColors = colors;

        // Destroy existing chart if it exists
        if (municipalityCharts[chartKey]) {
            municipalityCharts[chartKey].destroy();
        }

        // Create new chart
        var ctx = canvas.getContext('2d');
        municipalityCharts[chartKey] = new Chart(ctx, {
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
     * Show chart panel and update chart
     */
    function showChartPanel() {
        createChartPanel();
        
        if (!municipalityChartPanel) {
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

        // Get selected municipalities
        var selectedMunicipalities = getSelectedMunicipalities();

        if (selectedMunicipalities.length === 0) {
            var panelContent = document.getElementById('municipality-flood-impact-chart-content');
            if (panelContent) {
                panelContent.innerHTML = '<div class="household-chart-no-data">Please select at least one municipality from the dropdown.</div>';
            }
            municipalityChartPanel.classList.add('active');
            return;
        }

        // For now, use the first selected municipality
        // If multiple are selected, you could aggregate or show separately
        var municipalityName = selectedMunicipalities[0];

        // Extract all data
        var extractedData = extractAllData(selectedFloodExtent);

        // Update all charts
        updateChart('hazardCounts', extractedData.hazardCounts, 'Hazard Counts');
        updateChart('totalAffected', extractedData.totalAffected, 'Total Affected');
        updateChart('totalExposed', extractedData.totalExposed, 'Total Exposed');
        updateChart('ageGroups', extractedData.ageGroups, 'Age Groups');
        updateChart('displaced', extractedData.displaced, 'Displaced');

        // Update title in header (this will be the main title)
        var titleElement = document.getElementById('municipality-flood-impact-title');
        if (titleElement) {
            titleElement.textContent = selectedFloodExtent + ' meter flood impact for the municipality of ' + municipalityName + '.';
        }

        municipalityChartPanel.classList.add('active');

        // Adjust main content
        var mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.add('household-chart-active');
        }

        currentFloodExtent = selectedFloodExtent;
        isChartActive = true;
    }

    /**
     * Hide chart panel
     */
    function hideChartPanel() {
        if (municipalityChartPanel) {
            municipalityChartPanel.classList.remove('active');
        }

        // Adjust main content
        var mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.remove('household-chart-active');
        }

        currentFloodExtent = null;
        isChartActive = false;
    }

    /**
     * Handle flood extent change - only update if chart is already active
     */
    function handleFloodExtentChange() {
        if (!isChartActive) {
            return;
        }

        var floodExtentSelect = document.getElementById('flood-extent-select');
        if (!floodExtentSelect) {
            return;
        }

        var selectedFloodExtent = floodExtentSelect.value;
        var selectedMunicipalities = getSelectedMunicipalities();
        var selectedBarangays = getSelectedBarangays();
        
        // Only update if municipality is selected, no barangay, and flood extent is selected
        if (selectedFloodExtent && selectedMunicipalities.length > 0 && selectedBarangays.length === 0) {
            showChartPanel();
        } else {
            hideChartPanel();
        }
    }

    /**
     * Initialize municipality flood impact chart functionality
     */
    function initialize() {
        // Wait for DOM and map to be ready
        if (typeof map === 'undefined' || !map) {
            setTimeout(initialize, 100);
            return;
        }

        // Listen for flood extent selection changes - only update if chart is already active
        var floodExtentSelect = document.getElementById('flood-extent-select');
        if (floodExtentSelect) {
            floodExtentSelect.addEventListener('change', function() {
                handleFloodExtentChange();
            });
        }

        // Handle Impact Report button click for municipality-level chart
        var impactBtn = document.querySelector('.impact-btn');
        if (impactBtn) {
            impactBtn.addEventListener('click', function(e) {
                var selectedMunicipalities = getSelectedMunicipalities();
                var selectedBarangays = getSelectedBarangays();
                var floodExtentSelect = document.getElementById('flood-extent-select');
                
                // Only handle municipality chart if municipality is selected and no barangay is selected
                if (selectedMunicipalities.length > 0 && selectedBarangays.length === 0) {
                    // Prevent the barangay chart handler from firing
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    
                    // Check if flood extent is selected
                    if (!floodExtentSelect || !floodExtentSelect.value) {
                        alert('Please select a flood extent to view municipality impact statistics.');
                        return;
                    }
                    
                    // Toggle municipality chart panel
                    if (isChartActive) {
                        hideChartPanel();
                    } else {
                        showChartPanel();
                    }
                }
                // If barangay is selected, let the existing barangay chart handler work (it fires after this one)
            }, true); // Use capture phase to fire before other handlers
        }

        console.log('Municipality flood impact chart functionality initialized');
    }

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
            if (checkbox.value) {
                selected.push(checkbox.value);
            }
        });
        return selected;
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready, but wait for map and layers to be initialized
        setTimeout(initialize, 500);
    }
})();


