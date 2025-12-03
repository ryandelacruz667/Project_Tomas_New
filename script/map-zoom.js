/**
 * Map Zoom Configuration
 * Sets the map to a specific scale (1:4453347)
 */

(function() {
    'use strict';

    /**
     * Set map zoom to a specific scale
     * @param {ol.Map} map - The OpenLayers map instance
     * @param {number} scale - The scale denominator (e.g., 4453347 for 1:4453347)
     */
    function setMapScale(map, scale) {
        if (!map) {
            console.error('Map instance not found');
            return;
        }

        var view = map.getView();
        if (!view) {
            console.error('Map view not found');
            return;
        }

        // Calculate resolution from scale
        // Scale = Resolution * 96 / 0.0254 (for Web Mercator with 96 DPI)
        // Resolution = Scale * 0.0254 / 96
        var resolution = (scale * 0.0254) / 96;

        // Get current center to maintain it
        var center = view.getCenter();
        if (!center) {
            // If no center is set, use the default center from the initial fit
            center = [13543776.582536, 1967437.253139];
        }

        // Set the resolution (zoom level)
        view.setResolution(resolution);
        view.setCenter(center);
    }

    /**
     * Initialize map zoom when map is ready
     */
    function initializeMapZoom() {
        // Wait for map to be available
        if (typeof map !== 'undefined' && map) {
            // Wait for the map to finish initial rendering (after fit() completes)
            var renderComplete = false;
            
            // Listen for render complete event
            map.once('rendercomplete', function() {
                renderComplete = true;
                // Small delay to ensure fit() has completed
                setTimeout(function() {
                    setMapScale(map, 4453347);
                }, 200);
            });
            
            // Fallback: if rendercomplete doesn't fire, set zoom after a delay
            setTimeout(function() {
                if (!renderComplete) {
                    setMapScale(map, 4453347);
                }
            }, 1000);
        } else {
            // Retry if map is not yet available
            setTimeout(initializeMapZoom, 100);
        }
    }

    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMapZoom);
    } else {
        // DOM is already ready
        initializeMapZoom();
    }
})();

