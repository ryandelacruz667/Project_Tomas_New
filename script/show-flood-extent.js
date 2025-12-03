/**
 * Show Flood Extent Layers
 * When a flood extent is selected, shows the corresponding PNG layer on the map
 */

(function() {
    'use strict';

    // Mapping of flood extent values to layer names
    var floodExtentLayers = {
        '24': 'lyr_24_33',
        '25': 'lyr_25_32',
        '26': 'lyr_26_31',
        '27': 'lyr_27_30',
        '28': 'lyr_28_29',
        '29': 'lyr_29_28',
        '30': 'lyr_30_27'
    };

    /**
     * Get a flood extent layer by value
     * @param {string} value - Flood extent value (24, 25, 26, etc.)
     * @returns {ol.layer.Image|null} - The layer or null
     */
    function getFloodExtentLayer(value) {
        var layerName = floodExtentLayers[value];
        if (!layerName) {
            return null;
        }

        // Try to get layer from global scope
        if (typeof window[layerName] !== 'undefined' && window[layerName]) {
            return window[layerName];
        }

        // Fallback: search through map layers
        if (typeof map !== 'undefined' && map) {
            var layers = map.getLayers();
            var layerArray = layers.getArray();
            
            for (var i = 0; i < layerArray.length; i++) {
                var layer = layerArray[i];
                
                // Check if it's a layer group
                if (layer instanceof ol.layer.Group) {
                    var groupLayers = layer.getLayers();
                    var groupArray = groupLayers.getArray();
                    for (var j = 0; j < groupArray.length; j++) {
                        var groupLayer = groupArray[j];
                        if (groupLayer.get('title') && 
                            groupLayer.get('title').indexOf(value) !== -1) {
                            return groupLayer;
                        }
                    }
                } else if (layer.get('title') && 
                          layer.get('title').indexOf(value) !== -1) {
                    return layer;
                }
            }
        }
        
        return null;
    }

    /**
     * Check if layer is on the map
     * @param {ol.layer.Layer} layer - The layer to check
     * @returns {boolean} - True if layer is on the map
     */
    function isLayerOnMap(layer) {
        if (!layer || typeof map === 'undefined' || !map) {
            return false;
        }

        var mapLayers = map.getLayers();
        var layerArray = mapLayers.getArray();
        
        for (var i = 0; i < layerArray.length; i++) {
            if (layerArray[i] === layer) {
                return true;
            }
            // Also check in layer groups
            if (layerArray[i] instanceof ol.layer.Group) {
                var groupLayers = layerArray[i].getLayers();
                var groupArray = groupLayers.getArray();
                for (var j = 0; j < groupArray.length; j++) {
                    if (groupArray[j] === layer) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Hide all flood extent layers
     */
    function hideAllFloodExtentLayers() {
        Object.keys(floodExtentLayers).forEach(function(value) {
            var layer = getFloodExtentLayer(value);
            if (layer) {
                layer.setVisible(false);
            }
        });
    }

    /**
     * Configure flood extent layer appearance
     * @param {ol.layer.Image} layer - The flood extent layer
     */
    function configureFloodExtentLayer(layer) {
        if (!layer) return;

        // Set reduced opacity (0.5 = 50% opacity)
        layer.setOpacity(0.5);

        // Set low z-index to appear below other layers (households, roads, schools, etc.)
        // Other layers typically use z-index 50-100, so we use a lower value
        layer.setZIndex(10);
    }

    /**
     * Show a specific flood extent layer
     * @param {string} value - Flood extent value
     */
    function showFloodExtentLayer(value) {
        // Hide all flood extent layers first
        hideAllFloodExtentLayers();

        // Get the selected layer
        var layer = getFloodExtentLayer(value);
        
        if (!layer) {
            console.warn('Flood extent layer not found for value:', value);
            return;
        }

        // Check if layer is on the map, if not, add it
        if (!isLayerOnMap(layer) && typeof map !== 'undefined' && map) {
            map.addLayer(layer);
            console.log('Flood extent layer added to map:', value);
        }

        // Configure layer appearance (opacity and z-index)
        configureFloodExtentLayer(layer);

        // Make layer visible
        layer.setVisible(true);

        // Force map to update
        if (typeof map !== 'undefined' && map) {
            map.render();
        }

        console.log('Flood extent layer shown:', value + ' meters');
    }

    /**
     * Handle flood extent selection change
     */
    function handleFloodExtentChange() {
        var select = document.getElementById('flood-extent-select');
        if (!select) {
            console.warn('Flood extent select not found');
            return;
        }

        var selectedValue = select.value;

        if (selectedValue === '' || selectedValue === null) {
            // No selection, hide all flood extent layers
            hideAllFloodExtentLayers();
            console.log('All flood extent layers hidden');
        } else {
            // Show the selected flood extent layer
            showFloodExtentLayer(selectedValue);
        }
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
            if (checkbox.value && !checkbox.disabled) {
                selected.push(checkbox.value);
            }
        });
        return selected;
    }

    /**
     * Enable or disable flood extent dropdown based on barangay selection
     */
    function updateFloodExtentDropdownState() {
        var select = document.getElementById('flood-extent-select');
        if (!select) return;

        var selectedBarangays = getSelectedBarangays();
        var hasSelection = selectedBarangays.length > 0;

        if (hasSelection) {
            // Enable dropdown
            select.disabled = false;
            select.style.opacity = '1';
            select.style.cursor = 'pointer';
        } else {
            // Disable dropdown
            select.disabled = true;
            select.style.opacity = '0.5';
            select.style.cursor = 'not-allowed';
            
            // Reset selection and hide all flood extent layers
            select.value = '';
            hideAllFloodExtentLayers();
        }
    }

    /**
     * Initialize flood extent functionality
     */
    function initialize() {
        // Wait for DOM and map to be ready
        if (typeof map === 'undefined' || !map) {
            setTimeout(initialize, 100);
            return;
        }

        var select = document.getElementById('flood-extent-select');
        if (!select) {
            console.warn('Flood extent select not found');
            setTimeout(initialize, 100);
            return;
        }

        // Initially hide all flood extent layers and configure their appearance
        Object.keys(floodExtentLayers).forEach(function(value) {
            var layer = getFloodExtentLayer(value);
            if (layer) {
                configureFloodExtentLayer(layer);
                layer.setVisible(false);
            }
        });

        // Initially disable the dropdown (no barangays selected yet)
        updateFloodExtentDropdownState();

        // Add change event listener
        select.addEventListener('change', function() {
            handleFloodExtentChange();
        });

        // Listen for barangay selection changes
        document.addEventListener('change', function(e) {
            if (e.target.type === 'checkbox' && 
                e.target.classList.contains('location-checkbox')) {
                
                // Check if it's a barangay checkbox
                var container = e.target.closest('.checkbox-container');
                if (container && container.id === 'barangay-checkboxes') {
                    // Update flood extent dropdown state
                    setTimeout(function() {
                        updateFloodExtentDropdownState();
                    }, 50);
                }
            }
        });

        console.log('Flood extent functionality initialized');
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready, but wait for map and layers to be initialized
        setTimeout(initialize, 500);
    }
})();

