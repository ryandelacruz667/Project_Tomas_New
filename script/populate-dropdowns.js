/**
 * Populate Location Multi-Select with Checkboxes
 * Extracts data from BarangayBoundaries_25 layer and populates
 * Region, Province, Municipality, and Barangay with checkbox multi-select
 */

(function() {
    'use strict';

    // Store the data for filtering
    var allFeatures = [];
    var regions = [];
    var provinces = [];
    var municipalities = [];
    var barangays = [];

    /**
     * Extract unique values from an array
     * @param {Array} array - Array of values
     * @returns {Array} - Array of unique sorted values
     */
    function getUniqueValues(array) {
        var unique = array.filter(function(value, index, self) {
            return value && value.trim() !== '' && self.indexOf(value) === index;
        });
        return unique.sort();
    }

    /**
     * Extract data from BarangayBoundaries GeoJSON
     */
    function extractData() {
        if (typeof json_BarangayBoundaries_25 === 'undefined') {
            console.error('json_BarangayBoundaries_25 not found');
            return false;
        }

        var geoJsonData = json_BarangayBoundaries_25;
        
        if (!geoJsonData || !geoJsonData.features) {
            console.error('Invalid GeoJSON data structure');
            return false;
        }

        // Extract all features
        allFeatures = geoJsonData.features;

        // Extract unique values for each level
        var regNames = [];
        var proNames = [];
        var munNames = [];
        var bgyNames = [];

        allFeatures.forEach(function(feature) {
            var properties = feature.properties;
            
            // Handle both Reg_Nme and Reg_Name (check both in case of typo)
            var regName = properties.Reg_Nme || properties.Reg_Name;
            if (regName) {
                regNames.push(regName);
            }
            if (properties.Pro_Name) {
                proNames.push(properties.Pro_Name);
            }
            if (properties.Mun_Name) {
                munNames.push(properties.Mun_Name);
            }
            if (properties.Bgy_Name) {
                bgyNames.push(properties.Bgy_Name);
            }
        });

        regions = getUniqueValues(regNames);
        provinces = getUniqueValues(proNames);
        municipalities = getUniqueValues(munNames);
        barangays = getUniqueValues(bgyNames);

        return true;
    }

    /**
     * Get selected checkbox values
     * @param {string} containerId - ID of the container
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
     * Clear all selections in a container
     * @param {string} containerId - ID of the container
     */
    function clearContainerSelections(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;
        
        var checkboxes = container.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(function(checkbox) {
            checkbox.checked = false;
        });
        
        // Update toggle text
        var toggleButton = container.querySelector('.checkbox-toggle-button');
        if (toggleButton) {
            var toggleText = toggleButton.querySelector('.toggle-text');
            var itemType = getItemType(containerId);
            var defaultText = 'Select ' + itemType.charAt(0).toUpperCase() + itemType.slice(1);
            if (itemType === 'municipality') {
                defaultText = 'Select Municipality';
            } else if (itemType === 'barangay') {
                defaultText = 'Select Barangay';
            } else if (itemType === 'province') {
                defaultText = 'Select Province';
            }
            if (toggleText) {
                toggleText.textContent = defaultText;
            }
        }
    }

    /**
     * Get item type name from container ID
     * @param {string} containerId - ID of the container
     * @returns {string} - Item type name (region, province, municipality, barangay)
     */
    function getItemType(containerId) {
        if (containerId.indexOf('region') !== -1) return 'region';
        if (containerId.indexOf('province') !== -1) return 'province';
        if (containerId.indexOf('municipality') !== -1) return 'municipality';
        if (containerId.indexOf('barangay') !== -1) return 'barangay';
        return 'item';
    }

    /**
     * Close all dropdowns except the one specified
     * @param {string} exceptContainerId - Container ID to keep open
     */
    function closeAllDropdownsExcept(exceptContainerId) {
        var allContainers = ['region-checkboxes', 'province-checkboxes', 'municipality-checkboxes', 'barangay-checkboxes'];
        allContainers.forEach(function(containerId) {
            if (containerId !== exceptContainerId) {
                var container = document.getElementById(containerId);
                if (!container) return;
                var wrapper = document.getElementById(containerId + '-wrapper');
                var toggleButton = container.previousElementSibling;
                if (wrapper && !wrapper.classList.contains('collapsed')) {
                    wrapper.classList.add('collapsed');
                    if (toggleButton) {
                        var icon = toggleButton.querySelector('.toggle-icon');
                        if (icon) icon.textContent = '▼';
                    }
                }
            }
        });
    }

    /**
     * Enable or disable a checkbox container
     * @param {string} containerId - ID of the container
     * @param {boolean} disabled - True to disable, false to enable
     */
    function setContainerDisabled(containerId, disabled) {
        var container = document.getElementById(containerId);
        if (!container) return;

        var toggleButton = container.querySelector('.checkbox-toggle-button');
        var wrapper = document.getElementById(containerId + '-wrapper');
        var checkboxes = container.querySelectorAll('input[type="checkbox"]');

        if (disabled) {
            // Disable the container
            if (toggleButton) {
                toggleButton.disabled = true;
                toggleButton.classList.add('disabled');
                toggleButton.style.opacity = '0.5';
                toggleButton.style.cursor = 'not-allowed';
            }
            if (wrapper) {
                wrapper.style.pointerEvents = 'none';
            }
            checkboxes.forEach(function(checkbox) {
                checkbox.disabled = true;
            });
            container.classList.add('disabled');
        } else {
            // Enable the container
            if (toggleButton) {
                toggleButton.disabled = false;
                toggleButton.classList.remove('disabled');
                toggleButton.style.opacity = '1';
                toggleButton.style.cursor = 'pointer';
            }
            if (wrapper) {
                wrapper.style.pointerEvents = 'auto';
            }
            checkboxes.forEach(function(checkbox) {
                checkbox.disabled = false;
            });
            container.classList.remove('disabled');
        }
    }

    /**
     * Update disabled state of all containers based on selections
     */
    function updateDisabledStates() {
        var selectedRegions = getSelectedValues('region-checkboxes');
        var selectedProvinces = getSelectedValues('province-checkboxes');
        var selectedMunicipalities = getSelectedValues('municipality-checkboxes');

        // Province is disabled if no region is selected
        setContainerDisabled('province-checkboxes', selectedRegions.length === 0);

        // Municipality is disabled if no province is selected
        setContainerDisabled('municipality-checkboxes', selectedProvinces.length === 0);

        // Barangay is disabled if no municipality is selected
        setContainerDisabled('barangay-checkboxes', selectedMunicipalities.length === 0);
    }

    /**
     * Create checkbox list HTML with collapsible functionality
     * @param {string} containerId - ID of the container
     * @param {Array} options - Array of option values
     * @param {string} label - Label text
     * @param {number} maxHeight - Max height for scrollable container
     * @param {boolean} disabled - Whether the container should be disabled
     */
    function createCheckboxList(containerId, options, label, maxHeight, disabled) {
        var container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found: ' + containerId);
            return;
        }

        // Get item type for display
        var itemType = getItemType(containerId);

        // Clear container
        container.innerHTML = '';

        // Get default text based on item type (capitalize first letter)
        var defaultText = 'Select ' + itemType.charAt(0).toUpperCase() + itemType.slice(1);
        if (itemType === 'municipality') {
            defaultText = 'Select Municipality';
        } else if (itemType === 'barangay') {
            defaultText = 'Select Barangay';
        } else if (itemType === 'region') {
            defaultText = 'Select Region';
        } else if (itemType === 'province') {
            defaultText = 'Select Province';
        }

        // Create toggle button/header
        var toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'checkbox-toggle-button';
        if (disabled) {
            toggleButton.disabled = true;
            toggleButton.classList.add('disabled');
            toggleButton.style.opacity = '0.5';
            toggleButton.style.cursor = 'not-allowed';
        }
        toggleButton.innerHTML = '<span class="toggle-icon">▼</span> <span class="toggle-text">' + defaultText + '</span>';
        
        // Create wrapper div (initially collapsed)
        var wrapper = document.createElement('div');
        wrapper.className = 'checkbox-list-wrapper collapsed';
        wrapper.id = containerId + '-wrapper';

        // Create scrollable container
        var scrollContainer = document.createElement('div');
        scrollContainer.className = 'checkbox-list';
        if (maxHeight) {
            scrollContainer.style.maxHeight = maxHeight + 'px';
        }

        // Add checkboxes for each option
        options.forEach(function(option, index) {
            var checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'checkbox-item';
            
            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = containerId + '-option-' + index;
            checkbox.value = option;
            checkbox.className = 'location-checkbox';
            if (disabled) {
                checkbox.disabled = true;
            }
            
            var checkboxLabel = document.createElement('label');
            checkboxLabel.htmlFor = containerId + '-option-' + index;
            checkboxLabel.textContent = option;
            if (disabled) {
                checkboxLabel.style.opacity = '0.5';
                checkboxLabel.style.cursor = 'not-allowed';
            }
            
            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(checkboxLabel);
            scrollContainer.appendChild(checkboxDiv);
        });

        wrapper.appendChild(scrollContainer);
        container.appendChild(toggleButton);
        container.appendChild(wrapper);

        // Set disabled state on wrapper if needed
        if (disabled) {
            wrapper.style.pointerEvents = 'none';
            container.classList.add('disabled');
        } else {
            wrapper.style.pointerEvents = 'auto';
            container.classList.remove('disabled');
        }

        // Function to update toggle button text with selected count
        var updateToggleText = function() {
            var selectedCount = scrollContainer.querySelectorAll('input[type="checkbox"].location-checkbox:checked').length;
            var toggleText = toggleButton.querySelector('.toggle-text');
            
            if (selectedCount === 0) {
                toggleText.textContent = defaultText;
            } else {
                // Format: "X selected [type]" with proper pluralization
                var typeText = itemType;
                if (selectedCount > 1) {
                    // Handle plural forms
                    if (itemType === 'municipality') {
                        typeText = 'municipalities';
                    } else {
                        typeText = itemType + 's';
                    }
                }
                toggleText.textContent = selectedCount + ' selected ' + typeText;
            }
        };

        // Toggle functionality
        toggleButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            
            // Don't allow toggle if disabled
            if (toggleButton.disabled || container.classList.contains('disabled')) {
                return;
            }
            
            var wasCollapsed = wrapper.classList.contains('collapsed');
            wrapper.classList.toggle('collapsed');
            var icon = toggleButton.querySelector('.toggle-icon');
            
            if (wrapper.classList.contains('collapsed')) {
                icon.textContent = '▼';
                updateToggleText();
            } else {
                icon.textContent = '▲';
                // Keep showing the count even when open
                updateToggleText();
                // Close other dropdowns when opening this one
                if (wasCollapsed) {
                    closeAllDropdownsExcept(containerId);
                }
            }
        });

        // Auto-close when checkbox is selected
        var closeAfterSelection = function() {
            setTimeout(function() {
                wrapper.classList.add('collapsed');
                var icon = toggleButton.querySelector('.toggle-icon');
                icon.textContent = '▼';
                updateToggleText();
            }, 300); // Small delay to show the selection
        };

        // Handle individual checkbox changes
        scrollContainer.addEventListener('change', function(e) {
            if (e.target.type === 'checkbox') {
                // Update toggle text
                updateToggleText();
                
                // Auto-close after selection
                closeAfterSelection();
                
                // Let the event bubble up to the container for filtering
            }
        });

        // Prevent closing when clicking inside the dropdown
        wrapper.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // Initialize toggle text
        updateToggleText();
    }

    /**
     * Filter provinces based on selected regions
     */
    function filterProvinces() {
        var selectedRegions = getSelectedValues('region-checkboxes');
        var municipalityContainer = document.getElementById('municipality-checkboxes');
        var barangayContainer = document.getElementById('barangay-checkboxes');

        // Reset dependent containers to show all options
        if (municipalityContainer) {
            createCheckboxList('municipality-checkboxes', municipalities, 'Municipality', 200, true);
        }
        if (barangayContainer) {
            createCheckboxList('barangay-checkboxes', barangays, 'Barangay', 200, true);
        }

        if (selectedRegions.length === 0) {
            // Show all provinces but disabled
            createCheckboxList('province-checkboxes', provinces, 'Province', 200, true);
            updateDisabledStates();
            return;
        }

        // Filter provinces for selected regions
        var provinceSet = new Set();

        allFeatures.forEach(function(feature) {
            var props = feature.properties;
            var regName = props.Reg_Nme || props.Reg_Name;
            if (selectedRegions.indexOf(regName) !== -1 && props.Pro_Name) {
                provinceSet.add(props.Pro_Name);
            }
        });

        var filteredProvinces = Array.from(provinceSet).sort();
        createCheckboxList('province-checkboxes', filteredProvinces, 'Province', 200, false);
        updateDisabledStates();
    }

    /**
     * Filter municipalities based on selected regions and provinces
     */
    function filterMunicipalities() {
        var selectedRegions = getSelectedValues('region-checkboxes');
        var selectedProvinces = getSelectedValues('province-checkboxes');
        var barangayContainer = document.getElementById('barangay-checkboxes');

        // Reset dependent container
        if (barangayContainer) {
            barangayContainer.innerHTML = '';
            // Repopulate with all barangays when municipalities are reset
            createCheckboxList('barangay-checkboxes', barangays, 'Barangay', 200, true);
        }

        // If no regions or provinces selected, show all municipalities but disabled
        if (selectedRegions.length === 0 || selectedProvinces.length === 0) {
            createCheckboxList('municipality-checkboxes', municipalities, 'Municipality', 200, true);
            updateDisabledStates();
            return;
        }

        // Filter municipalities based on selected regions and provinces
        var municipalitySet = new Set();

        allFeatures.forEach(function(feature) {
            var props = feature.properties;
            var regName = props.Reg_Nme || props.Reg_Name;
            if (selectedRegions.indexOf(regName) !== -1 && 
                selectedProvinces.indexOf(props.Pro_Name) !== -1 && 
                props.Mun_Name) {
                municipalitySet.add(props.Mun_Name);
            }
        });

        var filteredMunicipalities = Array.from(municipalitySet).sort();
        createCheckboxList('municipality-checkboxes', filteredMunicipalities, 'Municipality', 200, false);
        updateDisabledStates();
    }

    /**
     * Filter barangays based on selected regions, provinces, and municipalities
     */
    function filterBarangays() {
        var selectedRegions = getSelectedValues('region-checkboxes');
        var selectedProvinces = getSelectedValues('province-checkboxes');
        var selectedMunicipalities = getSelectedValues('municipality-checkboxes');

        // If no parent selections, show all barangays but disabled
        if (selectedRegions.length === 0 || selectedProvinces.length === 0 || selectedMunicipalities.length === 0) {
            createCheckboxList('barangay-checkboxes', barangays, 'Barangay', 200, true);
            updateDisabledStates();
            return;
        }

        // Filter barangays based on all parent selections
        var barangaySet = new Set();

        allFeatures.forEach(function(feature) {
            var props = feature.properties;
            var regName = props.Reg_Nme || props.Reg_Name;
            if (selectedRegions.indexOf(regName) !== -1 && 
                selectedProvinces.indexOf(props.Pro_Name) !== -1 && 
                selectedMunicipalities.indexOf(props.Mun_Name) !== -1 &&
                props.Bgy_Name) {
                barangaySet.add(props.Bgy_Name);
            }
        });

        var filteredBarangays = Array.from(barangaySet).sort();
        createCheckboxList('barangay-checkboxes', filteredBarangays, 'Barangay', 200, false);
        updateDisabledStates();
    }

    /**
     * Convert dropdowns to checkbox lists
     */
    function convertDropdownsToCheckboxes() {
        // Replace each select dropdown with a checkbox container
        var regionSelect = document.getElementById('region-select');
        var provinceSelect = document.getElementById('province-select');
        var municipalitySelect = document.getElementById('municipality-select');
        var barangaySelect = document.getElementById('barangay-select');

        if (regionSelect) {
            var regionContainer = document.createElement('div');
            regionContainer.id = 'region-checkboxes';
            regionContainer.className = 'checkbox-container';
            regionSelect.parentNode.replaceChild(regionContainer, regionSelect);
        }

        if (provinceSelect) {
            var provinceContainer = document.createElement('div');
            provinceContainer.id = 'province-checkboxes';
            provinceContainer.className = 'checkbox-container';
            provinceSelect.parentNode.replaceChild(provinceContainer, provinceSelect);
        }

        if (municipalitySelect) {
            var municipalityContainer = document.createElement('div');
            municipalityContainer.id = 'municipality-checkboxes';
            municipalityContainer.className = 'checkbox-container';
            municipalitySelect.parentNode.replaceChild(municipalityContainer, municipalitySelect);
        }

        if (barangaySelect) {
            var barangayContainer = document.createElement('div');
            barangayContainer.id = 'barangay-checkboxes';
            barangayContainer.className = 'checkbox-container';
            barangaySelect.parentNode.replaceChild(barangayContainer, barangaySelect);
        }
    }

    /**
     * Initialize checkbox lists and set up event listeners
     */
    function initializeDropdowns() {
        // Extract data
        if (!extractData()) {
            // Retry if data not ready
            setTimeout(initializeDropdowns, 100);
            return;
        }

        // Convert dropdowns to checkbox containers
        convertDropdownsToCheckboxes();

        // Populate all dropdowns initially with all options
        // Region is always enabled, others start disabled
        createCheckboxList('region-checkboxes', regions, 'Region', 200, false);
        createCheckboxList('province-checkboxes', provinces, 'Province', 200, true);
        createCheckboxList('municipality-checkboxes', municipalities, 'Municipality', 200, true);
        createCheckboxList('barangay-checkboxes', barangays, 'Barangay', 200, true);
        
        // Update disabled states
        updateDisabledStates();

        // Set up event listeners for cascading filters using event delegation
        var regionContainer = document.getElementById('region-checkboxes');
        var provinceContainer = document.getElementById('province-checkboxes');
        var municipalityContainer = document.getElementById('municipality-checkboxes');

        // Use event delegation on document to catch all change events
        // This ensures events are caught even when containers are recreated
        document.addEventListener('change', function(e) {
            if (e.target.type === 'checkbox') {
                // Check which container the checkbox belongs to
                var checkbox = e.target;
                var container = checkbox.closest('.checkbox-container');
                
                if (!container) return;
                
                var containerId = container.id;
                
                if (containerId === 'region-checkboxes') {
                    // If region was unchecked, clear province, municipality, and barangay selections
                    var selectedRegions = getSelectedValues('region-checkboxes');
                    if (selectedRegions.length === 0) {
                        // Clear all child selections
                        clearContainerSelections('province-checkboxes');
                        clearContainerSelections('municipality-checkboxes');
                        clearContainerSelections('barangay-checkboxes');
                    }
                    filterProvinces();
                } else if (containerId === 'province-checkboxes') {
                    // If province was unchecked, clear municipality and barangay selections
                    var selectedProvinces = getSelectedValues('province-checkboxes');
                    if (selectedProvinces.length === 0) {
                        // Clear child selections
                        clearContainerSelections('municipality-checkboxes');
                        clearContainerSelections('barangay-checkboxes');
                    }
                    filterMunicipalities();
                } else if (containerId === 'municipality-checkboxes') {
                    // If municipality was unchecked, clear barangay selections
                    var selectedMunicipalities = getSelectedValues('municipality-checkboxes');
                    if (selectedMunicipalities.length === 0) {
                        // Clear child selections
                        clearContainerSelections('barangay-checkboxes');
                    }
                    filterBarangays();
                }
                
                // Update disabled states after any change
                updateDisabledStates();
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            var clickedElement = e.target;
            var isInsideDropdown = false;
            var clickedContainerId = null;

            // Check if click is inside any dropdown
            ['region-checkboxes', 'province-checkboxes', 'municipality-checkboxes', 'barangay-checkboxes'].forEach(function(containerId) {
                var container = document.getElementById(containerId);
                var toggleButton = container ? container.previousElementSibling : null;
                if (container && (container.contains(clickedElement) || (toggleButton && toggleButton.contains(clickedElement)))) {
                    isInsideDropdown = true;
                    clickedContainerId = containerId;
                }
            });

            if (!isInsideDropdown) {
                closeAllDropdownsExcept(null);
            } else if (clickedContainerId) {
                // Close other dropdowns when opening a new one
                var wrapper = document.getElementById(clickedContainerId + '-wrapper');
                if (wrapper && wrapper.classList.contains('collapsed')) {
                    closeAllDropdownsExcept(clickedContainerId);
                }
            }
        });

        console.log('Location multi-select checkboxes initialized');
        console.log('Regions: ' + regions.length);
        console.log('Provinces: ' + provinces.length);
        console.log('Municipalities: ' + municipalities.length);
        console.log('Barangays: ' + barangays.length);
    }

    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDropdowns);
    } else {
        // DOM is already ready, but wait for the BarangayBoundaries script to load
        setTimeout(initializeDropdowns, 500);
    }
})();
