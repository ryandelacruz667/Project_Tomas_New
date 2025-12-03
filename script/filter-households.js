/**
 * Filter Households Layer by Selected Barangays
 * When Household button is clicked, filters the Households_26 layer
 * based on selected barangays from the dropdown menu
 * and hides the BarangayBoundaries layer
 */

(function() {
    'use strict';

    // Store original features for filtering
    var allHouseholdFeatures = [];
    var filteredHouseholdSource = null;
    var filteredHouseholdLayer = null;
    var isHouseholdActive = false;

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
     * Get the Households layer source
     * @returns {ol.source.Vector|null} - The Households source or null
     */
    function getHouseholdsSource() {
        if (typeof jsonSource_Households_26 !== 'undefined' && jsonSource_Households_26) {
            return jsonSource_Households_26;
        }
        return null;
    }

    /**
     * Get the Households layer
     * @returns {ol.layer.Vector|null} - The Households layer or null
     */
    function getHouseholdsLayer() {
        if (typeof lyr_Households_26 !== 'undefined' && lyr_Households_26) {
            return lyr_Households_26;
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
     * Create filtered Households layer
     */
    function createFilteredHouseholdLayer() {
        if (filteredHouseholdLayer) {
            return; // Already created
        }

        filteredHouseholdSource = new ol.source.Vector({
            attributions: ' '
        });

        filteredHouseholdLayer = new ol.layer.Vector({
            declutter: false,
            source: filteredHouseholdSource,
            style: style_Households_26,
            popuplayertitle: 'Households (Filtered)',
            interactive: true,
            title: '<img src="styles/legend/Households_26.png" /> Households (Filtered)',
            zIndex: 100
        });

        // Add to map
        if (typeof map !== 'undefined' && map) {
            map.addLayer(filteredHouseholdLayer);
        }
    }

    /**
     * Store all original features from Households layer
     */
    function storeOriginalFeatures() {
        var source = getHouseholdsSource();
        if (!source) {
            console.warn('Households source not found');
            return;
        }

        // Get all features from the source
        allHouseholdFeatures = source.getFeatures();
    }

    /**
     * Filter and display Households based on selected barangays
     */
    function filterAndShowHouseholds() {
        if (!isHouseholdActive) {
            return;
        }

        // Ensure filtered layer exists
        createFilteredHouseholdLayer();

        if (!filteredHouseholdSource) {
            console.warn('Filtered Households source not available');
            return;
        }

        // Clear previous filtered features
        filteredHouseholdSource.clear();

        // Get selected barangays
        var selectedBarangays = getSelectedBarangays();

        if (selectedBarangays.length === 0) {
            // No barangays selected, don't show anything
            return;
        }

        // Filter features based on selected barangays
        var filteredFeatures = [];

        allHouseholdFeatures.forEach(function(feature) {
            var properties = feature.getProperties();
            var barangay = properties.BARANGAY;

            // Check if feature's barangay matches any selected barangay
            if (barangay && selectedBarangays.indexOf(barangay) !== -1) {
                // Clone the feature to avoid modifying the original
                var clonedFeature = new ol.Feature({
                    geometry: feature.getGeometry().clone(),
                    fid: properties.fid,
                    'Exposed Population_fid': properties['Exposed Population_fid'],
                    'FAMILY-ID': properties['FAMILY-ID'],
                    BARANGAY: properties.BARANGAY,
                    fam_ID_2: properties.fam_ID_2,
                    MALE: properties.MALE,
                    FEMALE: properties.FEMALE,
                    INFANT: properties.INFANT,
                    CHILD: properties.CHILD,
                    ADULT: properties.ADULT,
                    ELDERLY: properties.ELDERLY
                });
                filteredFeatures.push(clonedFeature);
            }
        });

        // Add filtered features to the filtered layer
        if (filteredFeatures.length > 0) {
            filteredHouseholdSource.addFeatures(filteredFeatures);
        }

        console.log('Filtered ' + filteredFeatures.length + ' household features for selected barangays');
    }

    /**
     * Hide original Households layer and BarangayBoundaries layer
     */
    function hideOriginalLayers() {
        // Hide original Households layer
        var householdsLayer = getHouseholdsLayer();
        if (householdsLayer) {
            householdsLayer.setVisible(false);
        }

        // Hide BarangayBoundaries layer
        var barangayLayer = getBarangayBoundariesLayer();
        if (barangayLayer) {
            barangayLayer.setVisible(false);
        }
    }

    /**
     * Show original Households layer and BarangayBoundaries layer
     */
    function showOriginalLayers() {
        // Show original Households layer
        var householdsLayer = getHouseholdsLayer();
        if (householdsLayer) {
            householdsLayer.setVisible(true);
        }

        // Show BarangayBoundaries layer
        var barangayLayer = getBarangayBoundariesLayer();
        if (barangayLayer) {
            barangayLayer.setVisible(true);
        }
    }

    /**
     * Remove filtered Households layer
     */
    function removeFilteredLayer() {
        if (filteredHouseholdLayer && typeof map !== 'undefined' && map) {
            map.removeLayer(filteredHouseholdLayer);
            filteredHouseholdLayer = null;
            filteredHouseholdSource = null;
        }
    }

    /**
     * Handle Household button click
     */
    function handleHouseholdClick() {
        // Find Household nav-item to add/remove active class
        var householdNavItem = null;
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        
        navItems.forEach(function(item) {
            var span = item.querySelector('span');
            if (span && span.textContent.trim() === 'Household') {
                householdNavItem = item;
            }
        });

        // Toggle active state
        isHouseholdActive = !isHouseholdActive;

        if (isHouseholdActive) {
            // Add active class to button
            if (householdNavItem) {
                householdNavItem.classList.add('active');
            }

            // Store original features if not already stored
            if (allHouseholdFeatures.length === 0) {
                storeOriginalFeatures();
            }

            // Hide original layers
            hideOriginalLayers();

            // Filter and show households
            filterAndShowHouseholds();
        } else {
            // Remove active class from button
            if (householdNavItem) {
                householdNavItem.classList.remove('active');
            }

            // Show original layers
            showOriginalLayers();

            // Remove filtered layer
            removeFilteredLayer();
        }
    }

    /**
     * Initialize Household filtering functionality
     */
    function initialize() {
        // Wait for DOM and map to be ready
        if (typeof map === 'undefined' || !map) {
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

        // Add click handler to Household button
        householdNavItem.addEventListener('click', function(e) {
            e.preventDefault();
            handleHouseholdClick();
        });

        // Listen for barangay selection changes when Household is active
        document.addEventListener('change', function(e) {
            if (isHouseholdActive && 
                e.target.type === 'checkbox' && 
                e.target.classList.contains('location-checkbox')) {
                
                // Check if it's a barangay checkbox
                var container = e.target.closest('.checkbox-container');
                if (container && container.id === 'barangay-checkboxes') {
                    // Small delay to ensure checkbox state is updated
                    setTimeout(function() {
                        filterAndShowHouseholds();
                    }, 50);
                }
            }
        });

        // Store original features
        setTimeout(function() {
            storeOriginalFeatures();
        }, 500);

        console.log('Household filtering functionality initialized');
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready, but wait for map and layers to be initialized
        setTimeout(initialize, 500);
    }
})();

