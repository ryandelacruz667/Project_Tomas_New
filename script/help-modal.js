/**
 * Interactive Help Modal and Tooltip System
 * Provides step-by-step guidance and contextual help for users
 */

(function() {
    'use strict';

    var helpModal = null;
    var activeTooltip = null;
    var tooltipElements = [];

    /**
     * Create help modal
     */
    function createHelpModal() {
        if (helpModal) {
            return;
        }

        helpModal = document.createElement('div');
        helpModal.id = 'help-modal';
        helpModal.className = 'help-modal';

        var modalContent = document.createElement('div');
        modalContent.className = 'help-modal-content';

        // Header
        var header = document.createElement('div');
        header.className = 'help-modal-header';
        header.innerHTML = '<h2><i class="fas fa-question-circle"></i> User Guide</h2><button class="help-modal-close" id="help-modal-close">&times;</button>';

        // Tabs navigation
        var tabsNav = document.createElement('div');
        tabsNav.className = 'help-tabs-nav';
        tabsNav.innerHTML = '<button class="help-tab active" data-tab="getting-started">Getting Started</button>' +
                           '<button class="help-tab" data-tab="locations">Locations</button>' +
                           '<button class="help-tab" data-tab="database">Database</button>' +
                           '<button class="help-tab" data-tab="flood">Flood Analysis</button>' +
                           '<button class="help-tab" data-tab="statistics">Statistics</button>' +
                           '<button class="help-tab" data-tab="needs">Minimum Needs</button>' +
                           '<button class="help-tab" data-tab="tips">Tips</button>';

        // Content area
        var contentArea = document.createElement('div');
        contentArea.className = 'help-modal-body';

        // Getting Started Tab
        var gettingStartedTab = createTabContent('getting-started', true);
        gettingStartedTab.innerHTML = `
            <h3>Welcome to PROJECT TOMaS</h3>
            <p><strong>PROJECT TOMaS</strong> (Tactical Overlay for Mapping and Safety) is an interactive mapping application for analyzing flood impact and household data.</p>
            
            <h4>Quick Start:</h4>
            <ol>
                <li>Select your location using the dropdowns at the top (Region → Province → Municipality → Barangay)</li>
                <li>Click <strong>"Household"</strong> in the Database section to activate household features</li>
                <li>Select a flood extent (24-30 meters) from the Flood Extent dropdown</li>
                <li>Click <strong>"Impact Report"</strong> to view flood impact statistics</li>
                <li>Click <strong>"Minimum Needs"</strong> to view minimum needs infographics</li>
            </ol>

            <h4>Interface Overview:</h4>
            <ul>
                <li><strong>Top Bar:</strong> Location selectors for filtering geographic areas</li>
                <li><strong>Left Sidebar:</strong> Database layers and Flood Extent controls</li>
                <li><strong>Map Area:</strong> Interactive map showing geographic data</li>
                <li><strong>Bottom Panel:</strong> Statistics charts (appears when activated)</li>
                <li><strong>Right Panel:</strong> Minimum Needs infographics (appears when activated)</li>
            </ul>
        `;

        // Locations Tab
        var locationsTab = createTabContent('locations');
        locationsTab.innerHTML = `
            <h3>Selecting Locations</h3>
            <p>Use the dropdown menus at the top of the screen to filter data by geographic location.</p>
            
            <h4>Step-by-Step:</h4>
            <ol>
                <li><strong>Select Region:</strong> Choose a region from the "Region" dropdown</li>
                <li><strong>Select Province:</strong> Choose a province (options update based on region)</li>
                <li><strong>Select Municipality:</strong> Choose a municipality (options update based on province)</li>
                <li><strong>Select Barangay(s):</strong> 
                    <ul>
                        <li>Click the "Barangay" dropdown</li>
                        <li>A checkbox list will appear</li>
                        <li>Select one or multiple barangays</li>
                        <li>The map will automatically zoom to show selected areas</li>
                    </ul>
                </li>
            </ol>

            <div class="help-tip">
                <i class="fas fa-lightbulb"></i> <strong>Tip:</strong> You can select multiple barangays to compare data across different areas.
            </div>
        `;

        // Database Tab
        var databaseTab = createTabContent('database');
        databaseTab.innerHTML = `
            <h3>Database Layers</h3>
            <p>The Database section provides access to various data layers. Click any item to activate it.</p>
            
            <h4>Available Layers:</h4>
            <div class="help-feature-list">
                <div class="help-feature-item">
                    <i class="fas fa-home"></i>
                    <div>
                        <strong>Household</strong>
                        <p>Shows household data and enables statistics. <em>Must be activated to view statistics and flood impact data.</em></p>
                    </div>
                </div>
                <div class="help-feature-item">
                    <i class="fas fa-users"></i>
                    <div>
                        <strong>ACVs</strong>
                        <p>Shows ACV (Affected/Vulnerable Communities) data on the map.</p>
                    </div>
                </div>
                <div class="help-feature-item">
                    <i class="fas fa-cog"></i>
                    <div>
                        <strong>Equipment</strong>
                        <p>Displays equipment locations and information.</p>
                    </div>
                </div>
                <div class="help-feature-item">
                    <i class="fas fa-road"></i>
                    <div>
                        <strong>Roads & Bridges</strong>
                        <p>Shows road and bridge infrastructure data.</p>
                    </div>
                </div>
                <div class="help-feature-item">
                    <i class="fas fa-hospital"></i>
                    <div>
                        <strong>Evac Center</strong>
                        <p>Displays evacuation center locations.</p>
                    </div>
                </div>
                <div class="help-feature-item">
                    <i class="fas fa-building"></i>
                    <div>
                        <strong>Buildings</strong>
                        <p>Shows building data and locations.</p>
                    </div>
                </div>
                <div class="help-feature-item">
                    <i class="fas fa-school"></i>
                    <div>
                        <strong>Schools</strong>
                        <p>Displays school locations and information.</p>
                    </div>
                </div>
                <div class="help-feature-item">
                    <i class="fas fa-file-alt"></i>
                    <div>
                        <strong>Documentation</strong>
                        <p>Shows documentation data.</p>
                    </div>
                </div>
            </div>

            <div class="help-important">
                <i class="fas fa-exclamation-circle"></i> <strong>Important:</strong> The Household button must be active (highlighted) to view statistics and flood impact data.
            </div>
        `;

        // Flood Analysis Tab
        var floodTab = createTabContent('flood');
        floodTab.innerHTML = `
            <h3>Flood Extent Analysis</h3>
            <p>Analyze flood impact at different water levels (24-30 meters).</p>
            
            <h4>How to Use:</h4>
            <ol>
                <li>Ensure <strong>Household</strong> is activated (click it in Database section)</li>
                <li>Select one or more barangays</li>
                <li>Choose a flood extent level from the dropdown (24-30 meters)</li>
                <li>The map will display the flood extent layer for that level</li>
                <li>Click <strong>"Impact Report"</strong> to view detailed statistics</li>
                <li>Click <strong>"Minimum Needs"</strong> to view resource requirements</li>
            </ol>

            <h4>Available Flood Extents:</h4>
            <ul>
                <li>24 meters</li>
                <li>25 meters</li>
                <li>26 meters</li>
                <li>27 meters</li>
                <li>28 meters</li>
                <li>29 meters</li>
                <li>30 meters</li>
            </ul>

            <div class="help-tip">
                <i class="fas fa-lightbulb"></i> <strong>Tip:</strong> Compare different flood extents to understand how impact increases with water level.
            </div>
        `;

        // Statistics Tab
        var statisticsTab = createTabContent('statistics');
        statisticsTab.innerHTML = `
            <h3>Viewing Statistics</h3>
            
            <h4>Household Statistics</h4>
            <p><strong>Requirements:</strong> Household button active + At least one barangay selected</p>
            <p>When these conditions are met, a bottom panel automatically appears showing:</p>
            <ul>
                <li><strong>Households by Barangay:</strong> Number of households per selected barangay</li>
                <li><strong>Total Population:</strong> Population count by barangay</li>
                <li><strong>Male and Female:</strong> Gender distribution (aggregated)</li>
                <li><strong>Age Groups:</strong> Breakdown by Infant, Child, Adult, and Elderly</li>
            </ul>

            <h4>Flood Impact Statistics</h4>
            <p><strong>Requirements:</strong> Household active + Flood extent selected + Barangay(s) selected</p>
            <p>Click the <strong>"Impact Report"</strong> button to view:</p>
            <ul>
                <li><strong>Total Affected Population:</strong> People affected by barangay</li>
                <li><strong>Age Groups:</strong> Affected population by age (Infant, Child, Adult, Elderly)</li>
                <li><strong>Gender:</strong> Affected population by gender (Male, Female)</li>
                <li><strong>Displaced Population:</strong> Number of displaced people by barangay</li>
                <li><strong>Displaced Gender:</strong> Gender breakdown of displaced population</li>
            </ul>

            <div class="help-note">
                <i class="fas fa-info-circle"></i> <strong>Note:</strong> All statistics are filtered based on your selected barangays and flood extent.
            </div>
        `;

        // Minimum Needs Tab
        var needsTab = createTabContent('needs');
        needsTab.innerHTML = `
            <h3>Minimum Needs Infographics</h3>
            <p>View detailed resource requirements for affected populations.</p>
            
            <h4>How to Access:</h4>
            <ol>
                <li>Activate <strong>Household</strong> button</li>
                <li>Select a flood extent (24-30 meters)</li>
                <li>Select one or more barangays</li>
                <li>Click <strong>"Minimum Needs"</strong> button</li>
                <li>A right-side panel will slide in with infographics</li>
            </ol>

            <h4>What You'll See:</h4>
            <p>Each infographic card displays:</p>
            <ul>
                <li><strong>Icon:</strong> Visual representation of the need</li>
                <li><strong>Category Name:</strong> Type of resource needed</li>
                <li><strong>Value with Unit:</strong> Quantity (packs, kits, liters, spaces, etc.)</li>
                <li><strong>Description:</strong> Brief explanation of the resource</li>
                <li><strong>Progress Bar:</strong> Visual indicator of relative quantity</li>
            </ul>

            <h4>Available Categories:</h4>
            <div class="help-categories-grid">
                <div class="help-category-item"><i class="fas fa-utensils"></i> Family Food Packs (packs)</div>
                <div class="help-category-item"><i class="fas fa-soap"></i> Hygiene Kits (kits)</div>
                <div class="help-category-item"><i class="fas fa-box"></i> Family Kits (kits)</div>
                <div class="help-category-item"><i class="fas fa-tint"></i> Water Kits (kits)</div>
                <div class="help-category-item"><i class="fas fa-glass-water"></i> Drinking Water (liters)</div>
                <div class="help-category-item"><i class="fas fa-water"></i> Clean Water (liters)</div>
                <div class="help-category-item"><i class="fas fa-droplet"></i> Water Demand (liters)</div>
                <div class="help-category-item"><i class="fas fa-home"></i> Shelter Space (spaces)</div>
                <div class="help-category-item"><i class="fas fa-toilet"></i> Toilets (units)</div>
                <div class="help-category-item"><i class="fas fa-child"></i> Child-Friendly Facilities</div>
                <div class="help-category-item"><i class="fas fa-tshirt"></i> Laundry Spaces</div>
                <div class="help-category-item"><i class="fas fa-faucet"></i> Water Spaces</div>
                <div class="help-category-item"><i class="fas fa-hospital"></i> Health Stations</div>
                <div class="help-category-item"><i class="fas fa-bed"></i> Couple Rooms</div>
            </div>
        `;

        // Tips Tab
        var tipsTab = createTabContent('tips');
        tipsTab.innerHTML = `
            <h3>Tips & Troubleshooting</h3>
            
            <h4>Common Issues</h4>
            <div class="help-issue">
                <strong>Statistics panels not showing?</strong>
                <ul>
                    <li>✓ Ensure Household button is active (highlighted)</li>
                    <li>✓ Select at least one barangay</li>
                    <li>✓ For flood statistics, select a flood extent</li>
                </ul>
            </div>

            <div class="help-issue">
                <strong>Minimum Needs panel not appearing?</strong>
                <ul>
                    <li>✓ Ensure Household button is active</li>
                    <li>✓ Select a flood extent</li>
                    <li>✓ Select at least one barangay</li>
                    <li>✓ Click the "Minimum Needs" button</li>
                </ul>
            </div>

            <div class="help-issue">
                <strong>Charts showing "No Data"?</strong>
                <ul>
                    <li>✓ Verify barangay selection</li>
                    <li>✓ Check if data exists for selected flood extent</li>
                    <li>✓ Try a different flood extent level</li>
                </ul>
            </div>

            <h4>Best Practices</h4>
            <ol>
                <li>Always select locations in order: Region → Province → Municipality → Barangay</li>
                <li>Activate Household before viewing any statistics</li>
                <li>Select multiple barangays to compare data across areas</li>
                <li>Use the close button (×) to hide panels when not needed</li>
                <li>Click buttons again to toggle panels on/off</li>
            </ol>

            <h4>Quick Workflows</h4>
            <div class="help-workflow">
                <strong>Flood Impact Analysis:</strong>
                <ol>
                    <li>Click "Household" → Select locations → Select flood extent</li>
                    <li>Click "Impact Report" → View bottom statistics</li>
                    <li>Click "Minimum Needs" → View right-side infographics</li>
                </ol>
            </div>

            <div class="help-workflow">
                <strong>Household Analysis:</strong>
                <ol>
                    <li>Click "Household" → Select locations</li>
                    <li>Bottom panel shows statistics automatically</li>
                </ol>
            </div>
        `;

        contentArea.appendChild(gettingStartedTab);
        contentArea.appendChild(locationsTab);
        contentArea.appendChild(databaseTab);
        contentArea.appendChild(floodTab);
        contentArea.appendChild(statisticsTab);
        contentArea.appendChild(needsTab);
        contentArea.appendChild(tipsTab);

        modalContent.appendChild(header);
        modalContent.appendChild(tabsNav);
        modalContent.appendChild(contentArea);

        helpModal.appendChild(modalContent);
        document.body.appendChild(helpModal);

        // Tab switching
        var tabs = tabsNav.querySelectorAll('.help-tab');
        tabs.forEach(function(tab) {
            tab.addEventListener('click', function() {
                var targetTab = tab.getAttribute('data-tab');
                switchTab(targetTab);
                
                // Update active tab
                tabs.forEach(function(t) { t.classList.remove('active'); });
                tab.classList.add('active');
            });
        });

        // Close button
        var closeBtn = document.getElementById('help-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideHelpModal);
        }

        // Close on outside click
        helpModal.addEventListener('click', function(e) {
            if (e.target === helpModal) {
                hideHelpModal();
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && helpModal.classList.contains('active')) {
                hideHelpModal();
            }
        });
    }

    /**
     * Create tab content div
     */
    function createTabContent(tabId, isActive) {
        var tab = document.createElement('div');
        tab.className = 'help-tab-content' + (isActive ? ' active' : '');
        tab.id = 'help-tab-' + tabId;
        return tab;
    }

    /**
     * Switch between tabs
     */
    function switchTab(tabId) {
        var allTabs = document.querySelectorAll('.help-tab-content');
        allTabs.forEach(function(tab) {
            tab.classList.remove('active');
        });
        
        var targetTab = document.getElementById('help-tab-' + tabId);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    /**
     * Show help modal
     */
    function showHelpModal() {
        createHelpModal();
        if (helpModal) {
            helpModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide help modal
     */
    function hideHelpModal() {
        if (helpModal) {
            helpModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Create tooltip for an element
     */
    function createTooltip(element, text) {
        if (!element || !text) return;

        var tooltip = document.createElement('div');
        tooltip.className = 'help-tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        element.addEventListener('mouseenter', function(e) {
            var rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
            tooltip.classList.add('show');
            activeTooltip = tooltip;
        });

        element.addEventListener('mouseleave', function() {
            tooltip.classList.remove('show');
            setTimeout(function() {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 200);
        });

        tooltipElements.push({ element: element, tooltip: tooltip });
    }

    /**
     * Initialize tooltips for key UI elements
     */
    function initializeTooltips() {
        // Wait for DOM to be ready
        setTimeout(function() {
            // Household button
            var householdBtn = document.querySelector('.nav-item span');
            if (householdBtn && householdBtn.textContent.trim() === 'Household') {
                createTooltip(householdBtn.closest('.nav-item'), 'Click to activate household features and enable statistics');
            }

            // Impact Report button
            var impactBtn = document.querySelector('.impact-btn');
            if (impactBtn) {
                createTooltip(impactBtn, 'View flood impact statistics (requires: Household active + Flood extent + Barangay selected)');
            }

            // Minimum Needs button
            var needsBtn = document.querySelector('.needs-btn');
            if (needsBtn) {
                createTooltip(needsBtn, 'View minimum needs infographics (requires: Household active + Flood extent + Barangay selected)');
            }

            // Flood extent dropdown
            var floodSelect = document.getElementById('flood-extent-select');
            if (floodSelect) {
                createTooltip(floodSelect, 'Select flood water level (24-30 meters) to analyze impact');
            }

            // Barangay dropdown
            var barangaySelect = document.getElementById('barangay-select');
            if (barangaySelect) {
                createTooltip(barangaySelect, 'Select one or more barangays to filter data');
            }
        }, 1000);
    }

    /**
     * Create help button
     */
    function createHelpButton() {
        var helpButton = document.createElement('button');
        helpButton.id = 'help-button';
        helpButton.className = 'help-button';
        helpButton.innerHTML = '<i class="fas fa-question-circle"></i>';
        helpButton.title = 'Open Help Guide';
        helpButton.addEventListener('click', showHelpModal);
        
        // Add to top bar
        var topBar = document.querySelector('.top-bar');
        if (topBar) {
            topBar.appendChild(helpButton);
        } else {
            document.body.appendChild(helpButton);
        }
    }

    /**
     * Initialize help system
     */
    function init() {
        createHelpButton();
        initializeTooltips();
        console.log('Help system initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 500);
    }

    // Expose functions globally if needed
    window.showHelpModal = showHelpModal;
    window.hideHelpModal = hideHelpModal;

})();

