/**
 * Show Roads Layer
 * When Roads & Bridges button is clicked, shows the Roads_23 layer on the map
 * with improved styling
 */

(function() {
    'use strict';

    var isRoadsActive = false;
    var improvedRoadStyle = null;

    /**
     * Get the Roads layer
     * @returns {ol.layer.Vector|null} - The Roads layer or null
     */
    function getRoadsLayer() {
        if (typeof lyr_Roads_23 !== 'undefined' && lyr_Roads_23) {
            return lyr_Roads_23;
        }
        return null;
    }

    /**
     * Create improved road style based on highway type
     * @param {ol.Feature} feature - The road feature
     * @param {number} resolution - Map resolution
     * @returns {Array<ol.style.Style>} - Array of styles
     */
    function createImprovedRoadStyle(feature, resolution) {
        if (!feature) {
            return [];
        }

        var properties = feature.getProperties();
        var highwayType = properties.highway || 'unclassified';
        var styles = [];

        // Define road styling based on highway type
        var roadConfig = {
            'motorway': { width: 8, color: '#ff6b6b', casingWidth: 10, casingColor: '#ffffff' },
            'trunk': { width: 7, color: '#ff8787', casingWidth: 9, casingColor: '#ffffff' },
            'primary': { width: 6, color: '#ffa8a8', casingWidth: 8, casingColor: '#ffffff' },
            'secondary': { width: 5, color: '#ffb3b3', casingWidth: 7, casingColor: '#ffffff' },
            'tertiary': { width: 4, color: '#ffcccc', casingWidth: 6, casingColor: '#ffffff' },
            'residential': { width: 3, color: '#ffe0e0', casingWidth: 5, casingColor: '#ffffff' },
            'service': { width: 2.5, color: '#f0f0f0', casingWidth: 4, casingColor: '#ffffff' },
            'unclassified': { width: 3, color: '#e8e8e8', casingWidth: 5, casingColor: '#ffffff' },
            'track': { width: 2, color: '#d4a574', casingWidth: 3.5, casingColor: '#ffffff' },
            'path': { width: 1.5, color: '#c9c9c9', casingWidth: 3, casingColor: '#ffffff' },
            'footway': { width: 1, color: '#d4d4d4', casingWidth: 2.5, casingColor: '#ffffff' }
        };

        // Get config for this road type, default to unclassified
        var config = roadConfig[highwayType] || roadConfig['unclassified'];

        // Adjust width based on zoom level (resolution)
        // Resolution is in map units per pixel, smaller = more zoomed in
        var zoomFactor = 1;
        if (resolution && resolution > 0) {
            zoomFactor = Math.max(0.5, Math.min(2, 1 / (resolution * 1000)));
        }
        var lineWidth = config.width * zoomFactor;
        var casingWidth = config.casingWidth * zoomFactor;

        // Create casing (outline) style - drawn first so it appears behind
        styles.push(new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: config.casingColor,
                width: casingWidth,
                lineCap: 'round',
                lineJoin: 'round'
            }),
            zIndex: 1
        }));

        // Create main road style
        styles.push(new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: config.color,
                width: lineWidth,
                lineCap: 'round',
                lineJoin: 'round'
            }),
            zIndex: 2
        }));

        // Add center line for major roads
        if (['motorway', 'trunk', 'primary', 'secondary'].indexOf(highwayType) !== -1) {
            styles.push(new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#ffffff',
                    width: Math.max(0.5, lineWidth * 0.2),
                    lineCap: 'round',
                    lineJoin: 'round',
                    lineDash: [5, 5]
                }),
                zIndex: 3
            }));
        }

        return styles;
    }

    /**
     * Apply improved style to Roads layer
     */
    function applyImprovedStyle() {
        var roadsLayer = getRoadsLayer();
        if (!roadsLayer) {
            console.warn('Roads layer not found');
            return;
        }

        // Check if source has features
        var source = roadsLayer.getSource();
        if (source) {
            var features = source.getFeatures();
            console.log('Roads layer has', features.length, 'features');
            
            if (features.length === 0) {
                console.warn('Roads layer source has no features');
            }
        }

        // Set the improved style function
        roadsLayer.setStyle(function(feature, resolution) {
            if (!feature) {
                return null;
            }
            try {
                return createImprovedRoadStyle(feature, resolution);
            } catch (e) {
                console.error('Error creating road style:', e);
                // Fallback to simple style
                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#ff0000',
                        width: 3,
                        lineCap: 'round',
                        lineJoin: 'round'
                    })
                });
            }
        });

        console.log('Improved road styling applied');
    }

    /**
     * Restore original style
     */
    function restoreOriginalStyle() {
        var roadsLayer = getRoadsLayer();
        if (!roadsLayer) {
            return;
        }

        // Restore original style if it exists
        if (typeof style_Roads_23 !== 'undefined') {
            roadsLayer.setStyle(style_Roads_23);
        } else {
            // Fallback to simple style
            roadsLayer.setStyle(new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(152,125,183,1.0)',
                    width: 0.988,
                    lineCap: 'square',
                    lineJoin: 'bevel'
                })
            }));
        }
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
     * Show Roads layer
     */
    function showRoads() {
        var roadsLayer = getRoadsLayer();
        if (!roadsLayer) {
            console.warn('Roads layer not found');
            return;
        }

        // Check if layer is on the map, if not, add it
        if (!isLayerOnMap(roadsLayer) && typeof map !== 'undefined' && map) {
            map.addLayer(roadsLayer);
            console.log('Roads layer added to map');
        }

        // Apply improved style
        applyImprovedStyle();

        // Make layer visible
        roadsLayer.setVisible(true);

        // Bring to front (higher z-index)
        roadsLayer.setZIndex(50);

        // Force map to update
        if (typeof map !== 'undefined' && map) {
            map.render();
        }

        console.log('Roads layer shown. Visible:', roadsLayer.getVisible(), 'On map:', isLayerOnMap(roadsLayer));
    }

    /**
     * Hide Roads layer
     */
    function hideRoads() {
        var roadsLayer = getRoadsLayer();
        if (roadsLayer) {
            roadsLayer.setVisible(false);
        }
    }

    /**
     * Handle Roads & Bridges button click
     */
    function handleRoadsClick() {
        // Find Roads & Bridges nav-item to add/remove active class
        var roadsNavItem = null;
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        
        navItems.forEach(function(item) {
            var span = item.querySelector('span');
            if (span && span.textContent.trim() === 'Roads & Bridges') {
                roadsNavItem = item;
            }
        });

        // Toggle active state
        isRoadsActive = !isRoadsActive;

        if (isRoadsActive) {
            // Add active class to button
            if (roadsNavItem) {
                roadsNavItem.classList.add('active');
            }

            // Show roads with improved style
            showRoads();
        } else {
            // Remove active class from button
            if (roadsNavItem) {
                roadsNavItem.classList.remove('active');
            }

            // Hide roads
            hideRoads();

            // Restore original style (optional - you might want to keep the improved style)
            // restoreOriginalStyle();
        }
    }

    /**
     * Initialize Roads functionality
     */
    function initialize() {
        // Wait for DOM and map to be ready
        if (typeof map === 'undefined' || !map) {
            setTimeout(initialize, 100);
            return;
        }

        // Wait for Roads layer to be defined
        if (typeof lyr_Roads_23 === 'undefined' || !lyr_Roads_23) {
            setTimeout(initialize, 100);
            return;
        }

        // Find Roads & Bridges nav-item
        var roadsNavItem = null;
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        
        navItems.forEach(function(item) {
            var span = item.querySelector('span');
            if (span && span.textContent.trim() === 'Roads & Bridges') {
                roadsNavItem = item;
            }
        });

        if (!roadsNavItem) {
            console.warn('Roads & Bridges nav-item not found');
            return;
        }

        // Verify Roads layer source has features
        var roadsLayer = getRoadsLayer();
        if (roadsLayer) {
            var source = roadsLayer.getSource();
            if (source) {
                var features = source.getFeatures();
                console.log('Roads layer initialized with', features.length, 'features');
                
                // Check feature geometry
                if (features.length > 0) {
                    var firstFeature = features[0];
                    var geometry = firstFeature.getGeometry();
                    if (geometry) {
                        var extent = geometry.getExtent();
                        console.log('First road feature extent:', extent);
                    }
                }
            }
        }

        // Add click handler to Roads & Bridges button
        roadsNavItem.addEventListener('click', function(e) {
            e.preventDefault();
            handleRoadsClick();
        });

        // Initially hide roads layer (optional - remove if you want it visible by default)
        // hideRoads();

        console.log('Roads & Bridges functionality initialized');
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready, but wait for map and layers to be initialized
        setTimeout(initialize, 500);
    }
})();

