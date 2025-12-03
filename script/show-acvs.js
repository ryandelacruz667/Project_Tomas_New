/**
 * Show ACVs Data Panel
 * When ACVs button is clicked, filters Excel data by selected municipality
 * and displays it in a right-side panel
 */

(function() {
    'use strict';

    var acvsPanel = null;
    var isACVsActive = false;

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
            if (checkbox.value && !checkbox.disabled) {
                selected.push(checkbox.value);
            }
        });
        return selected;
    }

    /**
     * Create the ACVs data panel
     */
    function createACVsPanel() {
        if (acvsPanel) {
            return; // Panel already exists
        }

        // Create panel container
        acvsPanel = document.createElement('div');
        acvsPanel.id = 'acvs-panel';
        acvsPanel.className = 'acvs-panel';

        // Create panel header
        var panelHeader = document.createElement('div');
        panelHeader.className = 'acvs-panel-header';
        panelHeader.innerHTML = '<h3>ACVs Data</h3><button class="acvs-close-btn" id="acvs-close-btn">&times;</button>';

        // Create panel content
        var panelContent = document.createElement('div');
        panelContent.className = 'acvs-panel-content';
        panelContent.id = 'acvs-panel-content';

        // Create loading message
        var loadingDiv = document.createElement('div');
        loadingDiv.className = 'acvs-loading';
        loadingDiv.textContent = 'Loading ACVs data...';
        panelContent.appendChild(loadingDiv);

        // Assemble panel
        acvsPanel.appendChild(panelHeader);
        acvsPanel.appendChild(panelContent);

        // Add to body
        document.body.appendChild(acvsPanel);

        // Close button handler
        var closeBtn = document.getElementById('acvs-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                hideACVsPanel();
            });
        }

        // Load Excel data when panel is created
        loadAndDisplayACVsData();
    }

    /**
     * Load and display ACVs data filtered by selected municipalities
     */
    function loadAndDisplayACVsData() {
        var panelContent = document.getElementById('acvs-panel-content');
        if (!panelContent) return;

        // Get selected municipalities
        var selectedMunicipalities = getSelectedMunicipalities();

        if (selectedMunicipalities.length === 0) {
            panelContent.innerHTML = '<div class="acvs-error">Please select at least one municipality from the dropdown.</div>';
            return;
        }

        // Show loading
        panelContent.innerHTML = '<div class="acvs-loading">Loading ACVs data...</div>';

        // Check if data is already loaded
        if (window.ACVsExcelReader && window.ACVsExcelReader.isDataLoaded()) {
            displayFilteredData(selectedMunicipalities);
        } else {
            // Load the Excel file
            if (window.ACVsExcelReader) {
                window.ACVsExcelReader.loadACVsData()
                    .then(function(data) {
                        displayFilteredData(selectedMunicipalities);
                    })
                    .catch(function(error) {
                        console.error('Error loading ACVs data:', error);
                        panelContent.innerHTML = '<div class="acvs-error">Error loading ACVs data: ' + error + '</div>';
                    });
            } else {
                panelContent.innerHTML = '<div class="acvs-error">ACVs Excel Reader is not available. Please check if the library is loaded.</div>';
            }
        }
    }

    /**
     * Display filtered ACVs data
     * @param {Array} selectedMunicipalities - Array of selected municipality names
     */
    function displayFilteredData(selectedMunicipalities) {
        var panelContent = document.getElementById('acvs-panel-content');
        if (!panelContent) return;

        try {
            var headers = window.ACVsExcelReader.getHeaders();
            var allData = window.ACVsExcelReader.getDataAsObjects();

            // Find the municipality column (try common variations)
            var municipalityColumn = null;
            var municipalityHeader = headers.find(function(header) {
                var lower = header.toLowerCase();
                return lower.includes('municipality') || lower.includes('mun') || lower === 'municipality';
            });

            if (!municipalityHeader) {
                // Try to find it by checking first few rows
                console.warn('Municipality column not found in headers, trying to detect...');
                municipalityHeader = headers[0]; // Fallback to first column
            }

            // Filter data by selected municipalities
            var filteredData = allData.filter(function(row) {
                var rowMunicipality = row[municipalityHeader];
                if (!rowMunicipality) return false;
                
                // Case-insensitive matching
                return selectedMunicipalities.some(function(selected) {
                    return String(rowMunicipality).toLowerCase() === String(selected).toLowerCase();
                });
            });

            if (filteredData.length === 0) {
                panelContent.innerHTML = '<div class="acvs-error">No ACVs data found for selected municipalities.</div>';
                return;
            }

            // Helper function to find column by keywords
            function findColumn(keywords) {
                return headers.find(function(header) {
                    var lower = header.toLowerCase();
                    return keywords.some(function(keyword) {
                        return lower.includes(keyword.toLowerCase());
                    });
                });
            }

            // Find column names for all required fields
            var rescueGroupColumn = findColumn(['rescue group', 'rescue', 'group name', 'name of rescue']);
            var addressColumn = findColumn(['address', 'location', 'addr']);
            var teamLeaderColumn = findColumn(['team leader', 'leader', 'team leader name', 'name of team leader']);
            var contactNumberColumn = findColumn(['contact number', 'contact', 'phone', 'mobile', 'telephone', 'tel']);
            var emailColumn = findColumn(['email', 'e-mail', 'email address']);
            var radioTypeColumn = findColumn(['radio type', 'radio', 'frequency', 'radio frequency']);
            var personnelColumn = findColumn(['personnel', 'total number of personnel', 'total personnel', 'number of personnel']);
            var responseCapabilitiesColumn = findColumn(['response', 'capabilities', 'response capabilities', 'capability']);

            // Create display HTML
            var html = '<div class="acvs-data-container">';
            
            filteredData.forEach(function(row, index) {
                html += '<div class="acvs-data-item">';
                html += '<div class="acvs-item-header">';
                html += '<h4>' + (row[municipalityHeader] || 'Unknown Municipality') + '</h4>';
                html += '</div>';
                
                html += '<div class="acvs-item-content">';
                
                // Name of Rescue Group
                html += '<div class="acvs-field">';
                html += '<span class="acvs-field-label">Name of Rescue Group:</span>';
                var rescueGroup = rescueGroupColumn && row[rescueGroupColumn] ? row[rescueGroupColumn] : null;
                html += '<span class="acvs-field-value">' + (rescueGroup || 'No available data') + '</span>';
                html += '</div>';
                
                // Address
                html += '<div class="acvs-field">';
                html += '<span class="acvs-field-label">Address:</span>';
                var address = addressColumn && row[addressColumn] ? row[addressColumn] : null;
                html += '<span class="acvs-field-value">' + (address || 'No available data') + '</span>';
                html += '</div>';
                
                // Name of Team Leader
                html += '<div class="acvs-field">';
                html += '<span class="acvs-field-label">Name of Team Leader:</span>';
                var teamLeader = teamLeaderColumn && row[teamLeaderColumn] ? row[teamLeaderColumn] : null;
                html += '<span class="acvs-field-value">' + (teamLeader || 'No available data') + '</span>';
                html += '</div>';
                
                // Contact Number
                html += '<div class="acvs-field">';
                html += '<span class="acvs-field-label">Contact Number:</span>';
                var contactNumber = contactNumberColumn && row[contactNumberColumn] ? row[contactNumberColumn] : null;
                html += '<span class="acvs-field-value">' + (contactNumber || 'No available data') + '</span>';
                html += '</div>';
                
                // Email Address
                html += '<div class="acvs-field">';
                html += '<span class="acvs-field-label">Email Address:</span>';
                var email = emailColumn && row[emailColumn] ? row[emailColumn] : null;
                html += '<span class="acvs-field-value">' + (email || 'No available data') + '</span>';
                html += '</div>';
                
                // Radio Type and Frequency
                html += '<div class="acvs-field">';
                html += '<span class="acvs-field-label">Radio Type and Frequency:</span>';
                var radioType = radioTypeColumn && row[radioTypeColumn] ? row[radioTypeColumn] : null;
                html += '<span class="acvs-field-value">' + (radioType || 'No available data') + '</span>';
                html += '</div>';
                
                // Total Number of Personnel
                html += '<div class="acvs-field">';
                html += '<span class="acvs-field-label">Total Number of Personnel:</span>';
                var personnel = personnelColumn && row[personnelColumn] ? row[personnelColumn] : null;
                html += '<span class="acvs-field-value">' + (personnel || 'No available data') + '</span>';
                html += '</div>';
                
                // Response Capabilities
                html += '<div class="acvs-field">';
                html += '<span class="acvs-field-label">Response Capabilities:</span>';
                var responseCapabilities = responseCapabilitiesColumn && row[responseCapabilitiesColumn] ? row[responseCapabilitiesColumn] : null;
                html += '<span class="acvs-field-value">' + (responseCapabilities || 'No available data') + '</span>';
                html += '</div>';
                
                html += '</div>';
                html += '</div>';
            });

            html += '</div>';
            panelContent.innerHTML = html;

        } catch (error) {
            console.error('Error displaying ACVs data:', error);
            panelContent.innerHTML = '<div class="acvs-error">Error displaying data: ' + error.message + '</div>';
        }
    }

    /**
     * Show ACVs panel
     */
    function showACVsPanel() {
        createACVsPanel();
        if (acvsPanel) {
            acvsPanel.classList.add('active');
            // Add class to main content to adjust layout
            var mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.classList.add('acvs-panel-active');
            }
            // Reload data in case municipality selection changed
            loadAndDisplayACVsData();
        }
        
        // Add active class to button
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        navItems.forEach(function(item) {
            var span = item.querySelector('span');
            if (span && span.textContent.trim() === 'ACVs') {
                item.classList.add('active');
            }
        });
    }

    /**
     * Hide ACVs panel
     */
    function hideACVsPanel() {
        if (acvsPanel) {
            acvsPanel.classList.remove('active');
        }
        
        // Remove class from main content
        var mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.remove('acvs-panel-active');
        }
        
        isACVsActive = false;
        
        // Remove active class from button
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        navItems.forEach(function(item) {
            var span = item.querySelector('span');
            if (span && span.textContent.trim() === 'ACVs') {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Handle ACVs button click
     */
    function handleACVsClick() {
        // Toggle active state
        isACVsActive = !isACVsActive;

        if (isACVsActive) {
            showACVsPanel();
        } else {
            hideACVsPanel();
        }
    }

    /**
     * Initialize ACVs functionality
     */
    function initialize() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
            return;
        }

        // Find ACVs nav-item
        var acvsNavItem = null;
        var navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        
        navItems.forEach(function(item) {
            var span = item.querySelector('span');
            if (span && span.textContent.trim() === 'ACVs') {
                acvsNavItem = item;
            }
        });

        if (!acvsNavItem) {
            console.warn('ACVs nav-item not found');
            return;
        }

        // Add click handler to ACVs button
        acvsNavItem.addEventListener('click', function(e) {
            e.preventDefault();
            handleACVsClick();
        });

        // Listen for municipality selection changes when ACVs is active
        document.addEventListener('change', function(e) {
            if (isACVsActive && 
                e.target.type === 'checkbox' && 
                e.target.classList.contains('location-checkbox')) {
                
                // Check if it's a municipality checkbox
                var container = e.target.closest('.checkbox-container');
                if (container && container.id === 'municipality-checkboxes') {
                    // Reload data when municipality selection changes
                    setTimeout(function() {
                        loadAndDisplayACVsData();
                    }, 100);
                }
            }
        });

        console.log('ACVs functionality initialized');
    }

    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 500);
    }
})();

