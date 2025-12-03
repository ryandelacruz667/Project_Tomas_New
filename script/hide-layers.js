/**
 * Remove All Layers Except Positron
 * Removes all layers from the map except for the Positron base map
 * This script runs early to prevent layers from being rendered
 */

(function() {
    'use strict';

    // Store original setVisible method to intercept calls
    var originalSetVisible = null;

    /**
     * Check if a layer or layer group contains Positron
     * @param {ol.layer.Base|ol.layer.Group} layer - The layer or layer group
     * @returns {boolean} - True if layer contains Positron
     */
    function containsPositron(layer) {
        if (!layer) {
            return false;
        }

        // Check if this is a layer group
        if (layer instanceof ol.layer.Group) {
            var layers = layer.getLayers();
            var layerArray = layers.getArray();
            for (var i = 0; i < layerArray.length; i++) {
                if (containsPositron(layerArray[i])) {
                    return true;
                }
            }
            return false;
        } else {
            // It's a regular layer
            var layerTitle = layer.get('title');
            return layerTitle && layerTitle.indexOf('Positron') !== -1;
        }
    }

    /**
     * Extract only Positron layer from a layer group
     * @param {ol.layer.Group} group - The layer group
     * @returns {ol.layer.Base|null} - The Positron layer or null
     */
    function extractPositronLayer(group) {
        if (!group || !(group instanceof ol.layer.Group)) {
            return null;
        }

        var layers = group.getLayers();
        var layerArray = layers.getArray();
        
        for (var i = 0; i < layerArray.length; i++) {
            var layer = layerArray[i];
            var layerTitle = layer.get('title');
            if (layerTitle && layerTitle.indexOf('Positron') !== -1) {
                return layer;
            }
        }
        return null;
    }

    /**
     * Remove all layers except Positron from the map
     * @param {ol.Map} map - The OpenLayers map instance
     */
    function removeAllLayersExceptPositron(map) {
        if (!map) {
            console.error('Map instance not found');
            return;
        }

        var layers = map.getLayers();
        var layersToRemove = [];
        var positronLayer = null;

        // First pass: find Positron and mark others for removal
        layers.forEach(function(layer) {
            if (containsPositron(layer)) {
                // If it's a group containing Positron, extract just Positron
                if (layer instanceof ol.layer.Group) {
                    positronLayer = extractPositronLayer(layer);
                } else {
                    positronLayer = layer;
                }
            } else {
                layersToRemove.push(layer);
            }
        });

        // Remove all non-Positron layers
        layersToRemove.forEach(function(layer) {
            map.removeLayer(layer);
        });

        // If we found Positron in a group, remove the group and add just Positron
        if (positronLayer) {
            layers.forEach(function(layer) {
                if (layer instanceof ol.layer.Group && containsPositron(layer)) {
                    map.removeLayer(layer);
                    // Add Positron directly if not already added
                    var alreadyAdded = false;
                    layers.forEach(function(existingLayer) {
                        if (existingLayer === positronLayer) {
                            alreadyAdded = true;
                        }
                    });
                    if (!alreadyAdded) {
                        map.addLayer(positronLayer);
                    }
                }
            });
        }

        console.log('All layers removed except Positron base map');
    }

    /**
     * Remove layers immediately when they're added to the map (if not Positron)
     * @param {ol.Map} map - The OpenLayers map instance
     */
    function setupLayerRemovalOnAdd(map) {
        if (!map) {
            return;
        }

        // Listen for when layers are added to the map
        map.getLayers().on('add', function(event) {
            var layer = event.element;
            if (layer && !containsPositron(layer)) {
                // Immediately remove the layer if it's not Positron
                setTimeout(function() {
                    map.removeLayer(layer);
                }, 0);
            }
        });
    }

    /**
     * Filter layersList to only include Positron before map creation
     */
    function filterLayersList() {
        // Wait for layersList to be defined
        if (typeof layersList !== 'undefined' && Array.isArray(layersList)) {
            var filteredList = [];
            var positronFound = false;

            layersList.forEach(function(layerGroup) {
                if (containsPositron(layerGroup)) {
                    // Extract Positron from the group
                    var positronLayer = extractPositronLayer(layerGroup);
                    if (positronLayer && !positronFound) {
                        filteredList.push(positronLayer);
                        positronFound = true;
                    }
                }
            });

            // Replace layersList with filtered version
            if (filteredList.length > 0) {
                layersList.length = 0;
                filteredList.forEach(function(layer) {
                    layersList.push(layer);
                });
                console.log('layersList filtered to only include Positron');
            }
        }
    }

    /**
     * Initialize layer removal immediately
     */
    function initializeLayerRemoval() {
        // First, try to filter layersList before map is created
        filterLayersList();
        
        // Wait for map to be available
        if (typeof map !== 'undefined' && map) {
            // Remove layers immediately, don't wait for rendering
            removeAllLayersExceptPositron(map);
            
            // Set up listener to remove layers as they're added
            setupLayerRemovalOnAdd(map);
            
            // Also remove layers after a short delay to catch any that were added before our listener
            setTimeout(function() {
                removeAllLayersExceptPositron(map);
            }, 10);
            
            // Additional check after layers are fully loaded
            setTimeout(function() {
                removeAllLayersExceptPositron(map);
            }, 100);
        } else {
            // Retry if map is not yet available
            setTimeout(initializeLayerRemoval, 10);
        }
    }

    // Start initialization immediately, don't wait for DOMContentLoaded
    // This ensures we catch layers as early as possible
    // Try to filter layersList before map is created
    filterLayersList();
    
    if (typeof map !== 'undefined' && map) {
        initializeLayerRemoval();
    } else {
        // Use a more aggressive polling approach
        var checkInterval = setInterval(function() {
            filterLayersList();
            if (typeof map !== 'undefined' && map) {
                clearInterval(checkInterval);
                initializeLayerRemoval();
            }
        }, 10);
        
        // Stop checking after 5 seconds
        setTimeout(function() {
            clearInterval(checkInterval);
        }, 5000);
    }
})();

