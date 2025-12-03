/**
 * Highlight and Zoom to Selected Items
 * Filters BarangayBoundaries layer based on dropdown selections,
 * highlights polygons in TRON style, and zooms to their extent
 */

(function() {
    'use strict';

    // Reference to the highlight layer
    var highlightLayer = null;
    var highlightSource = null;

    /**
     * Create TRON-style highlight style with glow effect
     * @returns {Array<ol.style.Style>} - Array of styles for TRON-style glow effect
     */
    function createTronStyle() {
        // Create multiple stroke layers for glow effect with thinner, darker strokes
        return [
            // Outer glow (thinner, darker)
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 153, 204, 0.2)', // Darker cyan outer glow
                    width: 3,
                    lineCap: 'round',
                    lineJoin: 'round'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 153, 204, 0.02)' // Reduced opacity fill
                })
            }),
            // Middle glow
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 153, 204, 0.4)', // Darker cyan middle glow
                    width: 2,
                    lineCap: 'round',
                    lineJoin: 'round'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 153, 204, 0.05)' // Reduced opacity fill
                })
            }),
            // Inner dark stroke (main line)
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#0099cc', // Darker cyan
                    width: 1.5,
                    lineCap: 'round',
                    lineJoin: 'round'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 153, 204, 0.08)' // Reduced opacity fill
                })
            })
        ];
    }

    /**
     * Create highlight layer if it doesn't exist
     */
    function ensureHighlightLayer() {
        if (!highlightLayer && typeof map !== 'undefined' && map) {
            highlightSource = new ol.source.Vector();
            highlightLayer = new ol.layer.Vector({
                source: highlightSource,
                style: createTronStyle(),
                zIndex: 1000, // Ensure it's on top
                title: 'Highlight Layer'
            });
            
            // Add highlight layer to map
            map.addLayer(highlightLayer);
        }
    }

    /**
     * Get selected checkbox values from a container
     * @param {string} containerId - ID of the checkbox container
     * @returns {Array} - Array of selected values
     */
    function getSelectedValues(containerId) {
        var container = document.getElementById(containerId);
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
     * Get the BarangayBoundaries layer from the map
     * @returns {ol.layer.Vector|null} - The BarangayBoundaries layer or null
     */
    function getBarangayBoundariesLayer() {
        // First try to get the layer from global variable (works even if removed from map)
        if (typeof lyr_BarangayBoundaries_25 !== 'undefined' && lyr_BarangayBoundaries_25) {
            return lyr_BarangayBoundaries_25;
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
                            groupLayer.get('title').indexOf('Barangay Boundaries') !== -1) {
                            return groupLayer;
                        }
                    }
                } else if (layer.get('title') && 
                          layer.get('title').indexOf('Barangay Boundaries') !== -1) {
                    return layer;
                }
            }
        }
        
        return null;
    }

    /**
     * Filter features based on selected dropdown values
     * @returns {Array} - Array of filtered features
     */
    function getFilteredFeatures() {
        var source = null;
        
        // Try to get source from layer
        var layer = getBarangayBoundariesLayer();
        if (layer) {
            source = layer.getSource();
        }
        
        // Fallback: try to get source directly from global variable
        if (!source && typeof jsonSource_BarangayBoundaries_25 !== 'undefined') {
            source = jsonSource_BarangayBoundaries_25;
        }
        
        if (!source) {
            console.warn('BarangayBoundaries source not found');
            return [];
        }

        var allFeatures = source.getFeatures();
        var selectedRegions = getSelectedValues('region-checkboxes');
        var selectedProvinces = getSelectedValues('province-checkboxes');
        var selectedMunicipalities = getSelectedValues('municipality-checkboxes');
        var selectedBarangays = getSelectedValues('barangay-checkboxes');

        // If nothing is selected, return empty array
        if (selectedRegions.length === 0 && 
            selectedProvinces.length === 0 && 
            selectedMunicipalities.length === 0 && 
            selectedBarangays.length === 0) {
            return [];
        }

        var filteredFeatures = [];

        allFeatures.forEach(function(feature) {
            var props = feature.getProperties();
            var regName = props.Reg_Nme || props.Reg_Name;
            var proName = props.Pro_Name;
            var munName = props.Mun_Name;
            var bgyName = props.Bgy_Name;

            // Check if feature matches all selected criteria
            // All selected levels must match (AND logic)
            var regionMatch = selectedRegions.length === 0 || selectedRegions.indexOf(regName) !== -1;
            var provinceMatch = selectedProvinces.length === 0 || selectedProvinces.indexOf(proName) !== -1;
            var municipalityMatch = selectedMunicipalities.length === 0 || selectedMunicipalities.indexOf(munName) !== -1;
            var barangayMatch = selectedBarangays.length === 0 || selectedBarangays.indexOf(bgyName) !== -1;

            // Feature matches if all selected criteria match
            if (regionMatch && provinceMatch && municipalityMatch && barangayMatch) {
                filteredFeatures.push(feature);
            }
        });

        return filteredFeatures;
    }

    /**
     * Highlight filtered features and zoom to extent
     */
    function highlightAndZoom() {
        // Ensure highlight layer exists
        ensureHighlightLayer();
        
        if (!highlightSource) {
            console.warn('Highlight source not available');
            return;
        }

        // Clear previous highlights
        highlightSource.clear();

        // Get filtered features
        var filteredFeatures = getFilteredFeatures();

        if (filteredFeatures.length === 0) {
            // No features selected, don't zoom
            return;
        }

        // Clone features for highlighting (to avoid modifying originals)
        var highlightFeatures = [];
        var extent = null;

        filteredFeatures.forEach(function(feature) {
            var geometry = feature.getGeometry();
            if (geometry) {
                // Clone the feature for highlighting
                var clonedFeature = new ol.Feature({
                    geometry: geometry.clone()
                });
                highlightFeatures.push(clonedFeature);

                // Calculate extent
                var featureExtent = geometry.getExtent();
                if (extent === null) {
                    extent = featureExtent;
                } else {
                    extent = ol.extent.extend(extent, featureExtent);
                }
            }
        });

        // Add features to highlight layer
        highlightSource.addFeatures(highlightFeatures);

        // Zoom to extent if we have one
        if (extent && typeof map !== 'undefined' && map) {
            var view = map.getView();
            if (view) {
                // Add padding to the extent
                var padding = 50; // pixels
                var size = map.getSize();
                
                view.fit(extent, {
                    size: size,
                    padding: [padding, padding, padding, padding],
                    duration: 400, // Animation duration in milliseconds (faster zoom)
                    maxZoom: 18 // Don't zoom in too close
                });
            }
        }
    }

    /**
     * Initialize highlight and zoom functionality
     */
    function initialize() {
        // Wait for map and layers to be ready
        if (typeof map === 'undefined' || !map) {
            setTimeout(initialize, 100);
            return;
        }

        // Ensure highlight layer is created
        ensureHighlightLayer();

        // Listen for checkbox changes in all dropdown containers
        document.addEventListener('change', function(e) {
            if (e.target.type === 'checkbox' && e.target.classList.contains('location-checkbox')) {
                // Small delay to ensure all checkboxes are updated
                setTimeout(function() {
                    highlightAndZoom();
                }, 50);
            }
        });

        console.log('Highlight and zoom functionality initialized');
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready, but wait for map to be initialized
        setTimeout(initialize, 500);
    }
})();

