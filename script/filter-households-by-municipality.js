/**
 * Filter Households Layer by Selected Municipality
 * When a municipality is selected, filters the Households_26 layer
 * based on the selected municipality and displays it on the map.
 * Shows an alert if no household data matches the selected municipality.
 * This function works independently from barangay filtering to avoid conflicts.
 */

(function() {
    'use strict';

    // Store original features for filtering
    var allHouseholdFeatures = [];
    var barangayToMunicipalityMap = {}; // Maps barangay name to municipality name
    var municipalityFilteredSource = null;
    var municipalityFilteredLayer = null;
    var isMunicipalityFilterActive = false;
    var householdButtonClickedFirst = false; // Track if household button was clicked before municipality selection
    var municipalitySelectedFirst = false; // Track if municipality was selected before household button click
    var municipalityUncheckedWhileActive = false; // Track if municipality was unchecked while household button was active
    var barangaySelectedWhileActive = false; // Track if barangay was selected while household button was active

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
     * Check if Household button is active
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

        return householdNavItem && householdNavItem.classList.contains('active');
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

        console.log('Built barangay to municipality mapping: ' + Object.keys(barangayToMunicipalityMap).length + ' barangays');
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
     * Create filtered Households layer for municipality filtering
     */
    function createMunicipalityFilteredLayer() {
        if (municipalityFilteredLayer) {
            return; // Already created
        }

        municipalityFilteredSource = new ol.source.Vector({
            attributions: ' '
        });

        municipalityFilteredLayer = new ol.layer.Vector({
            declutter: false,
            source: municipalityFilteredSource,
            style: style_Households_26,
            popuplayertitle: 'Households (Municipality Filtered)',
            interactive: true,
            title: '<img src="styles/legend/Households_26.png" /> Households (Municipality Filtered)',
            zIndex: 100
        });

        // Add to map
        if (typeof map !== 'undefined' && map) {
            map.addLayer(municipalityFilteredLayer);
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
     * Show alert message
     * @param {string} message - Alert message
     * @param {string} type - Alert type (danger, warning, info, success)
     */
    function showAlert(message, type) {
        var alertPlaceholder = document.getElementById('liveAlertPlaceholder');
        if (!alertPlaceholder) {
            console.warn('Alert placeholder not found');
            // Fallback to browser alert
            alert(message);
            return;
        }

        // Ensure placeholder is positioned correctly
        alertPlaceholder.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; pointer-events: none; z-index: 1000;';

        // Clear existing alerts
        alertPlaceholder.innerHTML = '';

        // Create alert button matching user's requested structure
        var alertBtn = document.createElement('button');
        alertBtn.type = 'button';
        alertBtn.className = 'btn btn-primary';
        alertBtn.id = 'liveAlertBtn';
        alertBtn.textContent = message;
        
        // Style the alert button to be visible and positioned at top center with larger size
        alertBtn.style.cssText = 'position: relative; margin: 20px auto; display: block; padding: 20px 40px; font-size: 18px; font-weight: bold; background-color: #ffc107; color: #000; border: 2px solid #ffc107; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3); pointer-events: auto;';
        
        // Add click handler to dismiss
        alertBtn.addEventListener('click', function() {
            alertPlaceholder.innerHTML = '';
        });

        alertPlaceholder.appendChild(alertBtn);

        // Auto-dismiss after 5 seconds
        setTimeout(function() {
            if (alertPlaceholder && alertPlaceholder.contains(alertBtn)) {
                alertPlaceholder.innerHTML = '';
            }
        }, 5000);
    }

    /**
     * Filter and display Households based on selected municipalities
     */
    function filterAndShowHouseholdsByMunicipality() {
        // Only filter if Household button is active
        if (!isHouseholdButtonActive()) {
            // Household button not active, reset and return
            resetToOriginalLayer();
            return;
        }

        // Check if barangay filtering is active - if so, don't interfere
        var selectedBarangays = getSelectedBarangays();
        if (selectedBarangays.length > 0) {
            // Barangay filtering is active, don't show municipality filter
            return;
        }

        // Check if household button was clicked before municipality selection
        // If so, disable municipality filtering permanently
        if (householdButtonClickedFirst) {
            resetToOriginalLayer();
            return;
        }

        // Check if municipality was selected before household button click
        // If so, disable municipality filtering permanently
        if (municipalitySelectedFirst) {
            resetToOriginalLayer();
            return;
        }

        // Check if municipality was unchecked while household button was active
        // If so, disable municipality filtering - require button click to re-enable
        if (municipalityUncheckedWhileActive) {
            resetToOriginalLayer();
            return;
        }

        // Check if barangay was selected while household button was active
        // If so, disable municipality filtering - require button click to re-enable
        if (barangaySelectedWhileActive) {
            resetToOriginalLayer();
            return;
        }

        // Ensure filtered layer exists
        createMunicipalityFilteredLayer();

        if (!municipalityFilteredSource) {
            console.warn('Municipality filtered Households source not available');
            return;
        }

        // Clear previous filtered features
        municipalityFilteredSource.clear();

        // Get selected municipalities
        var selectedMunicipalities = getSelectedMunicipalities();

        if (selectedMunicipalities.length === 0) {
            // No municipalities selected, hide filtered layer and show original
            if (municipalityFilteredLayer) {
                municipalityFilteredLayer.setVisible(false);
            }
            var householdsLayer = getHouseholdsLayer();
            if (householdsLayer) {
                householdsLayer.setVisible(true);
            }
            isMunicipalityFilterActive = false;
            return;
        }

        // Get barangays for selected municipalities
        var barangaysInMunicipalities = getBarangaysForMunicipalities(selectedMunicipalities);

        if (barangaysInMunicipalities.length === 0) {
            // No barangays found for selected municipalities
            showAlert('No household data within this Municipality!', 'warning');
            if (municipalityFilteredLayer) {
                municipalityFilteredLayer.setVisible(false);
            }
            var householdsLayer = getHouseholdsLayer();
            if (householdsLayer) {
                householdsLayer.setVisible(false);
            }
            isMunicipalityFilterActive = false;
            return;
        }

        // Filter features based on barangays in selected municipalities
        var filteredFeatures = [];

        allHouseholdFeatures.forEach(function(feature) {
            var properties = feature.getProperties();
            var barangay = properties.BARANGAY;

            // Check if feature's barangay is in any of the selected municipalities
            if (barangay && barangaysInMunicipalities.indexOf(barangay) !== -1) {
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

        // Check if any data was found
        if (filteredFeatures.length === 0) {
            // No household data found for selected municipalities
            showAlert('No household data within this Municipality!', 'warning');
            if (municipalityFilteredLayer) {
                municipalityFilteredLayer.setVisible(false);
            }
            var householdsLayer = getHouseholdsLayer();
            if (householdsLayer) {
                householdsLayer.setVisible(false);
            }
            isMunicipalityFilterActive = false;
            return;
        }

        // Add filtered features to the filtered layer
        municipalityFilteredSource.addFeatures(filteredFeatures);

        // Hide original layer and show filtered layer
        var householdsLayer = getHouseholdsLayer();
        if (householdsLayer) {
            householdsLayer.setVisible(false);
        }
        if (municipalityFilteredLayer) {
            municipalityFilteredLayer.setVisible(true);
        }

        isMunicipalityFilterActive = true;
        console.log('Filtered ' + filteredFeatures.length + ' household features for selected municipalities');
    }

    /**
     * Remove municipality filtered Households layer
     */
    function removeMunicipalityFilteredLayer() {
        if (municipalityFilteredLayer && typeof map !== 'undefined' && map) {
            map.removeLayer(municipalityFilteredLayer);
            municipalityFilteredLayer = null;
            municipalityFilteredSource = null;
        }
    }

    /**
     * Reset to show original layer
     */
    function resetToOriginalLayer() {
        if (municipalityFilteredLayer) {
            municipalityFilteredLayer.setVisible(false);
        }
        var householdsLayer = getHouseholdsLayer();
        if (householdsLayer) {
            householdsLayer.setVisible(true);
        }
        isMunicipalityFilterActive = false;
    }

    /**
     * Initialize municipality filtering functionality
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
                    // Track that municipality was selected/unselected
                    var selectedMunicipalities = getSelectedMunicipalities();
                    var wasChecked = e.target.checked;
                    
                    if (selectedMunicipalities.length > 0 && !isHouseholdButtonActive()) {
                        // Municipality selected before household button click - disable filtering
                        municipalitySelectedFirst = true;
                        municipalityUncheckedWhileActive = false;
                    } else if (selectedMunicipalities.length === 0) {
                        // Municipality deselected
                        if (isHouseholdButtonActive()) {
                            // Municipality unchecked while household button is active - disable function
                            municipalityUncheckedWhileActive = true;
                        }
                        // Reset other flags when municipality is deselected
                        municipalitySelectedFirst = false;
                        householdButtonClickedFirst = false;
                    } else if (selectedMunicipalities.length > 0 && isHouseholdButtonActive() && wasChecked) {
                        // Municipality was checked again
                        // If function was disabled due to previous uncheck, don't auto-filter
                        // User must click household button again to re-enable
                        if (municipalityUncheckedWhileActive) {
                            // Don't auto-filter, require button click
                            resetToOriginalLayer();
                            return;
                        }
                    }

                    // Small delay to ensure checkbox state is updated
                    setTimeout(function() {
                        // Only filter if household button is active and no barangay is selected
                        if (isHouseholdButtonActive()) {
                            var selectedBarangays = getSelectedBarangays();
                            if (selectedBarangays.length === 0) {
                                // Only filter if neither flag is set (correct order and not disabled)
                                if (!householdButtonClickedFirst && !municipalitySelectedFirst && !municipalityUncheckedWhileActive && !barangaySelectedWhileActive) {
                                    filterAndShowHouseholdsByMunicipality();
                                } else {
                                    resetToOriginalLayer();
                                }
                            } else {
                                // Barangay is selected, reset municipality filter
                                resetToOriginalLayer();
                            }
                        } else {
                            // Household button not active, reset
                            resetToOriginalLayer();
                        }
                    }, 50);
                }

                // If barangay is selected/unselected, handle municipality filter
                if (container && container.id === 'barangay-checkboxes') {
                    var wasChecked = e.target.checked;
                    var selectedBarangays = getSelectedBarangays();
                    
                    setTimeout(function() {
                        if (selectedBarangays.length > 0) {
                            // Barangay selected
                            if (isHouseholdButtonActive()) {
                                // Barangay selected while household button is active - disable function
                                barangaySelectedWhileActive = true;
                            }
                            // Reset municipality filter
                            resetToOriginalLayer();
                        } else {
                            // Barangay deselected
                            if (isHouseholdButtonActive()) {
                                // Barangay was deselected while household button is active
                                // Don't auto-filter - require button click to re-enable
                                // Keep barangaySelectedWhileActive flag set until button is clicked
                                resetToOriginalLayer();
                            } else {
                                // Household button not active, reset flag
                                barangaySelectedWhileActive = false;
                                resetToOriginalLayer();
                            }
                        }
                    }, 50);
                }
            }
        });

        // Listen for Household button click
        var householdNavItem = null;
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        
        navItems.forEach(function(item) {
            var span = item.querySelector('span');
            if (span && span.textContent.trim() === 'Household') {
                householdNavItem = item;
            }
        });

        if (householdNavItem) {
            householdNavItem.addEventListener('click', function(e) {
                // Small delay to let the active class be set/removed
                setTimeout(function() {
                    var isActive = isHouseholdButtonActive();
                    var selectedMunicipalities = getSelectedMunicipalities();
                    
                    if (isActive) {
                        // Household button was clicked/activated
                        var selectedBarangays = getSelectedBarangays();
                        
                        if (selectedMunicipalities.length === 0) {
                            // Button clicked before municipality selection - disable municipality filtering
                            householdButtonClickedFirst = true;
                            municipalitySelectedFirst = false;
                            municipalityUncheckedWhileActive = false;
                            // Reset barangay flag if no barangay is selected
                            if (selectedBarangays.length === 0) {
                                barangaySelectedWhileActive = false;
                            }
                            resetToOriginalLayer();
                        } else {
                            // Button clicked and municipality already selected - check if order was correct
                            // If municipality was selected first, disable filtering
                            if (municipalitySelectedFirst) {
                                resetToOriginalLayer();
                            } else {
                                // Correct order: municipality selected, then button clicked
                                // Reset the unchecked flag when button is clicked (re-enables filtering)
                                householdButtonClickedFirst = false;
                                municipalitySelectedFirst = false;
                                municipalityUncheckedWhileActive = false; // Re-enable when button is clicked
                                
                                // Reset barangay flag when button is clicked (re-enables filtering)
                                if (selectedBarangays.length === 0) {
                                    barangaySelectedWhileActive = false;
                                    filterAndShowHouseholdsByMunicipality();
                                } else {
                                    // Barangay is still selected, keep flag set
                                    resetToOriginalLayer();
                                }
                            }
                        }
                    } else {
                        // Household button was deactivated - reset flags
                        householdButtonClickedFirst = false;
                        municipalitySelectedFirst = false;
                        municipalityUncheckedWhileActive = false;
                        barangaySelectedWhileActive = false;
                        resetToOriginalLayer();
                    }
                }, 100);
            });
        }

        console.log('Household municipality filtering functionality initialized');
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready, but wait for map and layers to be initialized
        setTimeout(initialize, 500);
    }
})();

