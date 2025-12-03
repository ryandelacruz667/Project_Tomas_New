/**
 * Household Click Modal
 * Shows household member details from DB_0.js when household polygons are clicked
 */

(function() {
    'use strict';

    // Store DB_0 data
    var dbData = null;
    var dbFeatures = [];
    var householdModal = null;
    var filteredHouseholdLayer = null;

    /**
     * Load DB_0.js data
     */
    function loadDBData() {
        if (typeof json_DB_0 === 'undefined') {
            console.warn('json_DB_0 not found');
            return false;
        }

        dbData = json_DB_0;
        if (dbData && dbData.features) {
            dbFeatures = dbData.features;
            console.log('DB_0 data loaded:', dbFeatures.length, 'records');
            return true;
        }

        console.warn('DB_0 data structure invalid');
        return false;
    }

    /**
     * Generate random religion based on distribution
     * @returns {string} - Religion name
     */
    function generateRandomReligion() {
        var random = Math.random() * 100;
        
        if (random < 95) {
            return 'Roman Catholic';
        } else if (random < 97) {
            return 'Born Again Christian';
        } else if (random < 99) {
            return 'Iglesia Ni Cristo';
        } else {
            return 'Church of Christ';
        }
    }

    /**
     * Filter DB_0.js data by FAMILY-ID
     * @param {string} familyID - The FAMILY-ID to filter by
     * @returns {Array} - Filtered array of household member records
     */
    function filterDBByFamilyID(familyID) {
        if (!dbFeatures || dbFeatures.length === 0) {
            console.warn('DB_0 data not loaded');
            return [];
        }

        return dbFeatures.filter(function(feature) {
            var props = feature.properties;
            return props && props['FAMILY-ID'] === familyID;
        });
    }

    /**
     * Create modal HTML structure
     */
    function createModal() {
        if (householdModal) {
            return; // Modal already exists
        }

        // Create modal overlay
        householdModal = document.createElement('div');
        householdModal.className = 'household-modal';
        householdModal.id = 'household-modal';

        // Create modal content
        var modalContent = document.createElement('div');
        modalContent.className = 'household-modal-content';

        // Create modal header
        var modalHeader = document.createElement('div');
        modalHeader.className = 'household-modal-header';
        modalHeader.innerHTML = '<h3 id="household-modal-title">Household Members</h3><button class="household-modal-close" id="household-modal-close">&times;</button>';

        // Create modal body
        var modalBody = document.createElement('div');
        modalBody.className = 'household-modal-body';
        modalBody.id = 'household-modal-body';

        // Assemble modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        householdModal.appendChild(modalContent);

        // Add to body
        document.body.appendChild(householdModal);

        // Close button handler
        var closeBtn = document.getElementById('household-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideHouseholdModal);
        }

        // Close on overlay click
        householdModal.addEventListener('click', function(e) {
            if (e.target === householdModal) {
                hideHouseholdModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && householdModal.classList.contains('active')) {
                hideHouseholdModal();
            }
        });
    }

    /**
     * Show household modal with filtered data
     * @param {string} familyID - The FAMILY-ID from clicked polygon
     * @param {Array} filteredData - Filtered household member data
     */
    function showHouseholdModal(familyID, filteredData) {
        if (!householdModal) {
            createModal();
        }

        var modalBody = document.getElementById('household-modal-body');
        var modalTitle = document.getElementById('household-modal-title');
        
        if (!modalBody || !modalTitle) {
            console.error('Modal elements not found');
            return;
        }

        // Check if there's no data or all data is N/A
        if (filteredData.length === 0) {
            modalTitle.textContent = 'Household Members';
            modalBody.innerHTML = '<div class="household-modal-no-data">No data</div>';
        } else {
            // Check if all rows have only N/A values
            var hasValidData = false;
            filteredData.forEach(function(feature) {
                var props = feature.properties;
                var givenName = props['GIVEN NAME'];
                var lastName = props['LAST NAME'];
                var relation = props['RELATION'];
                var age = props['AGE'];
                var sex = props['SEX'];

                // Check if at least one field has real data (not empty, null, undefined, or 'N/A')
                if (givenName && givenName !== 'N/A' && givenName.trim() !== '') {
                    hasValidData = true;
                }
                if (lastName && lastName !== 'N/A' && lastName.trim() !== '') {
                    hasValidData = true;
                }
                if (relation && relation !== 'N/A' && relation.trim() !== '') {
                    hasValidData = true;
                }
                if (age && age !== 'N/A' && age.toString().trim() !== '') {
                    hasValidData = true;
                }
                if (sex && sex !== 'N/A' && sex.trim() !== '') {
                    hasValidData = true;
                }
            });

            if (!hasValidData) {
                // All data is N/A, show "No data"
                modalTitle.textContent = 'Household Members';
                modalBody.innerHTML = '<div class="household-modal-no-data">No data</div>';
            } else {
                // Count rows with valid data
                var rowCount = filteredData.length;
                modalTitle.textContent = 'Household Members (' + rowCount + ' Household member' + (rowCount !== 1 ? 's' : '') + ')';

                // Create table
                var tableHTML = '<div class="household-modal-table-container">';
                tableHTML += '<table class="household-modal-table">';
                tableHTML += '<thead><tr>';
                tableHTML += '<th>Given Name</th>';
                tableHTML += '<th>Last Name</th>';
                tableHTML += '<th>Relation</th>';
                tableHTML += '<th>Age</th>';
                tableHTML += '<th>Sex</th>';
                tableHTML += '<th>Religion</th>';
                tableHTML += '</tr></thead>';
                tableHTML += '<tbody>';

                // Add rows for each household member
                filteredData.forEach(function(feature) {
                    var props = feature.properties;
                    var givenName = props['GIVEN NAME'] || 'N/A';
                    var lastName = props['LAST NAME'] || 'N/A';
                    var relation = props['RELATION'] || 'N/A';
                    var age = props['AGE'] || 'N/A';
                    var sex = props['SEX'] || 'N/A';

                    // Check if this row has valid data (not all N/A)
                    var rowHasData = false;
                    if (givenName && givenName !== 'N/A' && givenName.toString().trim() !== '') rowHasData = true;
                    if (lastName && lastName !== 'N/A' && lastName.toString().trim() !== '') rowHasData = true;
                    if (relation && relation !== 'N/A' && relation.toString().trim() !== '') rowHasData = true;
                    if (age && age !== 'N/A' && age.toString().trim() !== '') rowHasData = true;
                    if (sex && sex !== 'N/A' && sex.toString().trim() !== '') rowHasData = true;

                    // Normalize values to 'N/A' if empty/null
                    if (!givenName || givenName.toString().trim() === '') givenName = 'N/A';
                    if (!lastName || lastName.toString().trim() === '') lastName = 'N/A';
                    if (!relation || relation.toString().trim() === '') relation = 'N/A';
                    if (!age || age.toString().trim() === '') age = 'N/A';
                    if (!sex || sex.toString().trim() === '') sex = 'N/A';

                    // Set religion: N/A if row has no valid data, otherwise generate random
                    var religion = rowHasData ? generateRandomReligion() : 'N/A';

                    tableHTML += '<tr>';
                    tableHTML += '<td>' + escapeHtml(givenName) + '</td>';
                    tableHTML += '<td>' + escapeHtml(lastName) + '</td>';
                    tableHTML += '<td>' + escapeHtml(relation) + '</td>';
                    tableHTML += '<td>' + escapeHtml(age) + '</td>';
                    tableHTML += '<td>' + escapeHtml(sex) + '</td>';
                    tableHTML += '<td>' + escapeHtml(religion) + '</td>';
                    tableHTML += '</tr>';
                });

                tableHTML += '</tbody></table>';
                tableHTML += '</div>';

                modalBody.innerHTML = tableHTML;
            }
        }

        // Show modal
        householdModal.classList.add('active');
    }

    /**
     * Hide household modal
     */
    function hideHouseholdModal() {
        if (householdModal) {
            householdModal.classList.remove('active');
        }
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     */
    function escapeHtml(text) {
        if (text === null || text === undefined) {
            return 'N/A';
        }
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get the filtered household layer
     * @returns {ol.layer.Vector|null} - The filtered household layer
     */
    function getFilteredHouseholdLayer() {
        // Try to get from filter-households.js scope
        if (typeof window.filteredHouseholdLayer !== 'undefined' && window.filteredHouseholdLayer) {
            return window.filteredHouseholdLayer;
        }

        // Fallback: search through map layers
        if (typeof map !== 'undefined' && map) {
            var layers = map.getLayers();
            var layerArray = layers.getArray();
            
            for (var i = 0; i < layerArray.length; i++) {
                var layer = layerArray[i];
                
                if (layer instanceof ol.layer.Vector) {
                    var title = layer.get('title');
                    if (title && title.indexOf('Households (Filtered)') !== -1) {
                        return layer;
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * Setup click handler for household polygons
     */
    function setupHouseholdClickHandler() {
        if (typeof map === 'undefined' || !map) {
            return;
        }

        // Listen for click events on the map
        map.on('singleclick', function(evt) {
            var pixel = evt.pixel;
            var clickedFeature = null;
            var clickedLayer = null;

            // Check if click is on a feature from filtered household layer
            map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                if (layer instanceof ol.layer.Vector) {
                    var title = layer.get('title');
                    if (title && title.indexOf('Households (Filtered)') !== -1) {
                        clickedFeature = feature;
                        clickedLayer = layer;
                        return true; // Stop checking other features
                    }
                }
            });

            if (clickedFeature && clickedLayer) {
                // Get FAMILY-ID from clicked feature
                var properties = clickedFeature.getProperties();
                var familyID = properties['FAMILY-ID'];

                if (familyID) {
                    // Filter DB_0 data by FAMILY-ID
                    var filteredData = filterDBByFamilyID(familyID);

                    // Show modal with filtered data (even if empty, will show "No data")
                    showHouseholdModal(familyID, filteredData);
                } else {
                    console.warn('FAMILY-ID not found in clicked feature');
                }
            }
        });
    }

    /**
     * Setup cursor styling on hover
     */
    function setupCursorStyling() {
        if (typeof map === 'undefined' || !map) {
            return;
        }

        var mapViewport = map.getViewport();

        // Listen for pointer move events
        map.on('pointermove', function(evt) {
            var pixel = evt.pixel;
            var isOverHousehold = false;

            // Check if pointer is over a filtered household feature
            map.forEachFeatureAtPixel(pixel, function(feature, layer) {
                if (layer instanceof ol.layer.Vector) {
                    var title = layer.get('title');
                    if (title && title.indexOf('Households (Filtered)') !== -1) {
                        isOverHousehold = true;
                        return true; // Stop checking
                    }
                }
            });

            // Change cursor based on hover state
            if (isOverHousehold) {
                mapViewport.style.cursor = 'pointer';
            } else {
                mapViewport.style.cursor = '';
            }
        });
    }

    /**
     * Initialize household modal functionality
     */
    function initialize() {
        // Wait for DOM and map to be ready
        if (typeof map === 'undefined' || !map) {
            setTimeout(initialize, 100);
            return;
        }

        // Load DB_0 data
        if (!loadDBData()) {
            // Retry if data not ready
            setTimeout(initialize, 500);
            return;
        }

        // Create modal
        createModal();

        // Setup click handler
        setupHouseholdClickHandler();

        // Setup cursor styling
        setupCursorStyling();

        console.log('Household modal functionality initialized');
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready, but wait for map and layers to be initialized
        setTimeout(initialize, 1000);
    }
})();

