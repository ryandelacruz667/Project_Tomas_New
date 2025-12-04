/**
 * Filter Schools Layer by Selected Municipality
 * When Schools button is clicked and a municipality is selected, filters the Schools_24 layer
 * based on the selected municipality and displays it on the map.
 * This function works independently from barangay filtering to avoid conflicts.
 */

(function() {
    'use strict';

    // Store original features for filtering
    var allSchoolFeatures = [];
    var barangayToMunicipalityMap = {}; // Maps barangay name to municipality name
    var municipalityFilteredSchoolSource = null;
    var municipalityFilteredSchoolLayer = null;
    var isMunicipalitySchoolFilterActive = false;

    /**
     * Check if Schools button is active
     * @returns {boolean} - True if Schools button is active
     */
    function isSchoolButtonActive() {
        var schoolNavItem = null;
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        
        navItems.forEach(function(item) {
            var span = item.querySelector('span');
            if (span && span.textContent.trim() === 'Schools') {
                schoolNavItem = item;
            }
        });

        return schoolNavItem && schoolNavItem.classList.contains('active');
    }

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
     * Build mapping from barangay to municipality using BarangayBoundaries data
     */
    function buildBarangayToMunicipalityMap() {
        if (typeof json_BarangayBoundaries_25 === 'undefined') {
            console.warn('BarangayBoundaries data not available');
            return;
        }

        var geoJsonData = json_BarangayBoundaries_25;
        if (!geoJsonData || !geoJsonData.features) {
            console.warn('Invalid BarangayBoundaries GeoJSON data');
            return;
        }

        // Clear existing map
        barangayToMunicipalityMap = {};

        // Build mapping
        geoJsonData.features.forEach(function(feature) {
            var properties = feature.properties;
            var barangayName = properties.Bgy_Name;
            var municipalityName = properties.Mun_Name;

            if (barangayName && municipalityName) {
                barangayToMunicipalityMap[barangayName] = municipalityName;
            }
        });

        console.log('Built barangay to municipality mapping for schools: ' + Object.keys(barangayToMunicipalityMap).length + ' barangays');
    }

    /**
     * Get barangays for selected municipalities
     * @param {Array} selectedMunicipalities - Array of municipality names
     * @returns {Array} - Array of barangay names in the selected municipalities
     */
    function getBarangaysForMunicipalities(selectedMunicipalities) {
        var barangays = [];
        
        Object.keys(barangayToMunicipalityMap).forEach(function(barangayName) {
            var municipalityName = barangayToMunicipalityMap[barangayName];
            if (selectedMunicipalities.indexOf(municipalityName) !== -1) {
                barangays.push(barangayName);
            }
        });

        return barangays;
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
     * Create filtered Schools layer for municipality filtering
     */
    function createMunicipalityFilteredSchoolLayer() {
        if (municipalityFilteredSchoolLayer) {
            return; // Already created
        }

        municipalityFilteredSchoolSource = new ol.source.Vector({
            attributions: ' '
        });

        municipalityFilteredSchoolLayer = new ol.layer.Vector({
            declutter: false,
            source: municipalityFilteredSchoolSource,
            style: style_Schools_24,
            popuplayertitle: 'Schools (Municipality Filtered)',
            interactive: false,
            title: '<img src="styles/legend/Schools_24.png" /> Schools (Municipality Filtered)',
            zIndex: 100
        });

        // Add to map
        if (typeof map !== 'undefined' && map) {
            map.addLayer(municipalityFilteredSchoolLayer);
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
     * Filter and display Schools based on selected municipalities
     */
    function filterAndShowSchoolsByMunicipality() {
        // Only filter if Schools button is active
        if (!isSchoolButtonActive()) {
            // Schools button not active, reset and return
            resetToOriginalSchoolLayer();
            return;
        }

        // Check if barangay filtering is active - if so, don't interfere
        var selectedBarangays = getSelectedBarangays();
        if (selectedBarangays.length > 0) {
            // Barangay filtering is active, don't show municipality filter
            return;
        }

        // Ensure filtered layer exists
        createMunicipalityFilteredSchoolLayer();

        if (!municipalityFilteredSchoolSource) {
            console.warn('Municipality filtered Schools source not available');
            return;
        }

        // Clear previous filtered features
        municipalityFilteredSchoolSource.clear();

        // Get selected municipalities
        var selectedMunicipalities = getSelectedMunicipalities();

        if (selectedMunicipalities.length === 0) {
            // No municipalities selected, hide filtered layer and show original
            if (municipalityFilteredSchoolLayer) {
                municipalityFilteredSchoolLayer.setVisible(false);
            }
            var schoolsLayer = getSchoolsLayer();
            if (schoolsLayer) {
                schoolsLayer.setVisible(true);
            }
            isMunicipalitySchoolFilterActive = false;
            return;
        }

        // Get barangays for selected municipalities
        var barangaysInMunicipalities = getBarangaysForMunicipalities(selectedMunicipalities);

        if (barangaysInMunicipalities.length === 0) {
            // No barangays found for selected municipalities
            if (municipalityFilteredSchoolLayer) {
                municipalityFilteredSchoolLayer.setVisible(false);
            }
            var schoolsLayer = getSchoolsLayer();
            if (schoolsLayer) {
                schoolsLayer.setVisible(false);
            }
            isMunicipalitySchoolFilterActive = false;
            return;
        }

        // Filter features based on barangays in selected municipalities
        var filteredFeatures = [];

        allSchoolFeatures.forEach(function(feature) {
            var properties = feature.getProperties();
            var barangay = properties.Bgy_Name;

            // Check if feature's barangay is in any of the selected municipalities
            if (barangay && barangaysInMunicipalities.indexOf(barangay) !== -1) {
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
            municipalityFilteredSchoolSource.addFeatures(filteredFeatures);
        }

        // Hide original layer and show filtered layer
        var schoolsLayer = getSchoolsLayer();
        if (schoolsLayer) {
            schoolsLayer.setVisible(false);
        }
        if (municipalityFilteredSchoolLayer) {
            municipalityFilteredSchoolLayer.setVisible(true);
        }

        isMunicipalitySchoolFilterActive = true;
        console.log('Filtered ' + filteredFeatures.length + ' school features for selected municipalities');
    }

    /**
     * Remove municipality filtered Schools layer
     */
    function removeMunicipalityFilteredSchoolLayer() {
        if (municipalityFilteredSchoolLayer && typeof map !== 'undefined' && map) {
            map.removeLayer(municipalityFilteredSchoolLayer);
            municipalityFilteredSchoolLayer = null;
            municipalityFilteredSchoolSource = null;
        }
    }

    /**
     * Reset to show original layer
     */
    function resetToOriginalSchoolLayer() {
        if (municipalityFilteredSchoolLayer) {
            municipalityFilteredSchoolLayer.setVisible(false);
        }
        var schoolsLayer = getSchoolsLayer();
        if (schoolsLayer) {
            schoolsLayer.setVisible(true);
        }
        isMunicipalitySchoolFilterActive = false;
    }

    /**
     * Initialize municipality filtering functionality for schools
     */
    function initialize() {
        // Wait for DOM and map to be ready
        if (typeof map === 'undefined' || !map) {
            setTimeout(initialize, 100);
            return;
        }

        // Build barangay to municipality mapping
        buildBarangayToMunicipalityMap();

        // Store original features
        setTimeout(function() {
            storeOriginalFeatures();
        }, 500);

        // Listen for municipality selection changes
        document.addEventListener('change', function(e) {
            if (e.target.type === 'checkbox' && 
                e.target.classList.contains('location-checkbox')) {
                
                // Check if it's a municipality checkbox
                var container = e.target.closest('.checkbox-container');
                if (container && container.id === 'municipality-checkboxes') {
                    // Small delay to ensure checkbox state is updated
                    setTimeout(function() {
                        // Only filter if Schools button is active and no barangay is selected
                        if (isSchoolButtonActive()) {
                            var selectedBarangays = getSelectedBarangays();
                            if (selectedBarangays.length === 0) {
                                filterAndShowSchoolsByMunicipality();
                            } else {
                                // Barangay is selected, reset municipality filter
                                resetToOriginalSchoolLayer();
                            }
                        } else {
                            // Schools button not active, reset
                            resetToOriginalSchoolLayer();
                        }
                    }, 50);
                }

                // If barangay is selected, reset municipality filter
                if (container && container.id === 'barangay-checkboxes') {
                    setTimeout(function() {
                        var selectedBarangays = getSelectedBarangays();
                        if (selectedBarangays.length > 0) {
                            // Barangay selected, reset municipality filter
                            resetToOriginalSchoolLayer();
                        } else {
                            // Barangay deselected, check if Schools button is active
                            if (isSchoolButtonActive()) {
                                filterAndShowSchoolsByMunicipality();
                            }
                        }
                    }, 50);
                }
            }
        });

        // Listen for Schools button click
        var schoolNavItem = null;
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        
        navItems.forEach(function(item) {
            var span = item.querySelector('span');
            if (span && span.textContent.trim() === 'Schools') {
                schoolNavItem = item;
            }
        });

        if (schoolNavItem) {
            schoolNavItem.addEventListener('click', function(e) {
                // Small delay to let the active class be set/removed
                setTimeout(function() {
                    var isActive = isSchoolButtonActive();
                    var selectedMunicipalities = getSelectedMunicipalities();
                    var selectedBarangays = getSelectedBarangays();
                    
                    if (isActive) {
                        // Schools button was clicked/activated
                        if (selectedBarangays.length === 0 && selectedMunicipalities.length > 0) {
                            // Municipality is selected and no barangay, filter by municipality
                            filterAndShowSchoolsByMunicipality();
                        } else if (selectedBarangays.length > 0) {
                            // Barangay is selected, let barangay filter handle it
                            resetToOriginalSchoolLayer();
                        }
                    } else {
                        // Schools button was deactivated
                        resetToOriginalSchoolLayer();
                    }
                }, 100);
            });
        }

        console.log('School municipality filtering functionality initialized');
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready, but wait for map and layers to be initialized
        setTimeout(initialize, 500);
    }
})();

