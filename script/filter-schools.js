/**
 * Filter Schools Layer by Selected Barangays
 * When Schools button is clicked, filters the Schools_24 layer
 * based on selected barangays from the dropdown menu
 * and hides the BarangayBoundaries layer
 */

(function() {
    'use strict';

    // Store original features for filtering
    var allSchoolFeatures = [];
    var filteredSchoolSource = null;
    var filteredSchoolLayer = null;
    var isSchoolActive = false;

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

    /**
     * Get the Schools layer source
     * @returns {ol.source.Vector|null} - The Schools source or null
     */
    function getSchoolsSource() {
        if (typeof jsonSource_Schools_24 !== 'undefined' && jsonSource_Schools_24) {
            return jsonSource_Schools_24;
        }
        return null;
    }

    /**
     * Get the Schools layer
     * @returns {ol.layer.Vector|null} - The Schools layer or null
     */
    function getSchoolsLayer() {
        if (typeof lyr_Schools_24 !== 'undefined' && lyr_Schools_24) {
            return lyr_Schools_24;
        }
        return null;
    }

    /**
     * Get the BarangayBoundaries layer
     * @returns {ol.layer.Vector|null} - The BarangayBoundaries layer or null
     */
    function getBarangayBoundariesLayer() {
        if (typeof lyr_BarangayBoundaries_25 !== 'undefined' && lyr_BarangayBoundaries_25) {
            return lyr_BarangayBoundaries_25;
        }
        return null;
    }

    /**
     * Create filtered Schools layer
     */
    function createFilteredSchoolLayer() {
        if (filteredSchoolLayer) {
            return; // Already created
        }

        filteredSchoolSource = new ol.source.Vector({
            attributions: ' '
        });

        filteredSchoolLayer = new ol.layer.Vector({
            declutter: false,
            source: filteredSchoolSource,
            style: style_Schools_24,
            popuplayertitle: 'Schools (Filtered)',
            interactive: false,
            title: '<img src="styles/legend/Schools_24.png" /> Schools (Filtered)',
            zIndex: 100
        });

        // Add to map
        if (typeof map !== 'undefined' && map) {
            map.addLayer(filteredSchoolLayer);
        }
    }

    /**
     * Store all original features from Schools layer
     */
    function storeOriginalFeatures() {
        var source = getSchoolsSource();
        if (!source) {
            console.warn('Schools source not found');
            return;
        }

        // Get all features from the source
        allSchoolFeatures = source.getFeatures();
    }

    /**
     * Filter and display Schools based on selected barangays
     */
    function filterAndShowSchools() {
        if (!isSchoolActive) {
            return;
        }

        // Ensure filtered layer exists
        createFilteredSchoolLayer();

        if (!filteredSchoolSource) {
            console.warn('Filtered Schools source not available');
            return;
        }

        // Clear previous filtered features
        filteredSchoolSource.clear();

        // Get selected barangays
        var selectedBarangays = getSelectedBarangays();

        if (selectedBarangays.length === 0) {
            // No barangays selected, don't show anything
            return;
        }

        // Filter features based on selected barangays
        var filteredFeatures = [];

        allSchoolFeatures.forEach(function(feature) {
            var properties = feature.getProperties();
            var barangay = properties.Bgy_Name;

            // Check if feature's barangay matches any selected barangay
            if (barangay && selectedBarangays.indexOf(barangay) !== -1) {
                // Clone the feature to avoid modifying the original
                var clonedFeature = new ol.Feature({
                    geometry: feature.getGeometry().clone(),
                    Bgy_Name: properties.Bgy_Name
                });
                filteredFeatures.push(clonedFeature);
            }
        });

        // Add filtered features to the filtered layer
        if (filteredFeatures.length > 0) {
            filteredSchoolSource.addFeatures(filteredFeatures);
        }

        console.log('Filtered ' + filteredFeatures.length + ' school features for selected barangays');
    }

    /**
     * Hide original Schools layer and BarangayBoundaries layer
     */
    function hideOriginalLayers() {
        // Hide original Schools layer
        var schoolsLayer = getSchoolsLayer();
        if (schoolsLayer) {
            schoolsLayer.setVisible(false);
        }

        // Hide BarangayBoundaries layer
        var barangayLayer = getBarangayBoundariesLayer();
        if (barangayLayer) {
            barangayLayer.setVisible(false);
        }
    }

    /**
     * Show original Schools layer and BarangayBoundaries layer
     */
    function showOriginalLayers() {
        // Show original Schools layer
        var schoolsLayer = getSchoolsLayer();
        if (schoolsLayer) {
            schoolsLayer.setVisible(true);
        }

        // Show BarangayBoundaries layer
        var barangayLayer = getBarangayBoundariesLayer();
        if (barangayLayer) {
            barangayLayer.setVisible(true);
        }
    }

    /**
     * Remove filtered Schools layer
     */
    function removeFilteredLayer() {
        if (filteredSchoolLayer && typeof map !== 'undefined' && map) {
            map.removeLayer(filteredSchoolLayer);
            filteredSchoolLayer = null;
            filteredSchoolSource = null;
        }
    }

    /**
     * Handle Schools button click
     */
    function handleSchoolClick() {
        // Find Schools nav-item to add/remove active class
        var schoolNavItem = null;
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        
        navItems.forEach(function(item) {
            var span = item.querySelector('span');
            if (span && span.textContent.trim() === 'Schools') {
                schoolNavItem = item;
            }
        });

        // Toggle active state
        isSchoolActive = !isSchoolActive;

        if (isSchoolActive) {
            // Add active class to button
            if (schoolNavItem) {
                schoolNavItem.classList.add('active');
            }

            // Store original features if not already stored
            if (allSchoolFeatures.length === 0) {
                storeOriginalFeatures();
            }

            // Hide original layers
            hideOriginalLayers();

            // Filter and show schools
            filterAndShowSchools();
        } else {
            // Remove active class from button
            if (schoolNavItem) {
                schoolNavItem.classList.remove('active');
            }

            // Show original layers
            showOriginalLayers();

            // Remove filtered layer
            removeFilteredLayer();
        }
    }

    /**
     * Initialize Schools filtering functionality
     */
    function initialize() {
        // Wait for DOM and map to be ready
        if (typeof map === 'undefined' || !map) {
            setTimeout(initialize, 100);
            return;
        }

        // Find Schools nav-item
        var schoolNavItem = null;
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        
        navItems.forEach(function(item) {
            var span = item.querySelector('span');
            if (span && span.textContent.trim() === 'Schools') {
                schoolNavItem = item;
            }
        });

        if (!schoolNavItem) {
            console.warn('Schools nav-item not found');
            return;
        }

        // Add click handler to Schools button
        schoolNavItem.addEventListener('click', function(e) {
            e.preventDefault();
            handleSchoolClick();
        });

        // Listen for barangay selection changes when Schools is active
        document.addEventListener('change', function(e) {
            if (isSchoolActive && 
                e.target.type === 'checkbox' && 
                e.target.classList.contains('location-checkbox')) {
                
                // Check if it's a barangay checkbox
                var container = e.target.closest('.checkbox-container');
                if (container && container.id === 'barangay-checkboxes') {
                    // Small delay to ensure checkbox state is updated
                    setTimeout(function() {
                        filterAndShowSchools();
                    }, 50);
                }
            }
        });

        // Store original features
        setTimeout(function() {
            storeOriginalFeatures();
        }, 500);

        console.log('Schools filtering functionality initialized');
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready, but wait for map and layers to be initialized
        setTimeout(initialize, 500);
    }
})();

