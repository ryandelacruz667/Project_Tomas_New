/**
 * Read Excel File and Convert to Arrays
 * Converts ACVs_Municipality.xlsx into arrays with headers
 * Requires SheetJS (xlsx) library
 */

(function() {
    'use strict';

    // Store the parsed data
    var acvsData = null;
    var acvsHeaders = [];
    var acvsRows = [];

    /**
     * Convert Excel file to arrays
     * @param {string} filePath - Path to the Excel file
     * @param {Function} callback - Callback function with (headers, rows, error)
     * @returns {Promise} - Promise that resolves with {headers, rows}
     */
    function convertExcelToArrays(filePath, callback) {
        // Check if SheetJS library is available
        if (typeof XLSX === 'undefined') {
            var error = 'SheetJS (XLSX) library is not loaded. Please include xlsx library.';
            console.error(error);
            if (callback) {
                callback(null, null, error);
            }
            return Promise.reject(error);
        }

        return fetch(filePath)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to load Excel file: ' + response.statusText);
                }
                return response.arrayBuffer();
            })
            .then(function(data) {
                // Parse the Excel file
                var workbook = XLSX.read(data, { type: 'array' });
                
                // Get the first sheet
                var firstSheetName = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to JSON with header row
                var jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                    header: 1,  // Use array format (row arrays)
                    defval: ''  // Default value for empty cells
                });
                
                if (jsonData.length === 0) {
                    throw new Error('Excel file is empty');
                }
                
                // First row contains headers
                var headers = jsonData[0].map(function(header) {
                    return header ? String(header).trim() : '';
                }).filter(function(header) {
                    return header !== ''; // Remove empty headers
                });
                
                // Remaining rows are data
                var rows = jsonData.slice(1).map(function(row) {
                    return row.map(function(cell) {
                        // Convert cell value to appropriate type
                        if (cell === null || cell === undefined) {
                            return '';
                        }
                        // If it's a number, keep it as number, otherwise convert to string
                        if (typeof cell === 'number') {
                            return cell;
                        }
                        return String(cell).trim();
                    });
                }).filter(function(row) {
                    // Remove completely empty rows
                    return row.some(function(cell) {
                        return cell !== '' && cell !== null && cell !== undefined;
                    });
                });
                
                // Store the data
                acvsHeaders = headers;
                acvsRows = rows;
                acvsData = {
                    headers: headers,
                    rows: rows,
                    sheetName: firstSheetName,
                    totalRows: rows.length,
                    totalColumns: headers.length
                };
                
                console.log('Excel file converted successfully');
                console.log('Headers:', headers);
                console.log('Total rows:', rows.length);
                console.log('Total columns:', headers.length);
                
                if (callback) {
                    callback(headers, rows, null);
                }
                
                return {
                    headers: headers,
                    rows: rows,
                    sheetName: firstSheetName,
                    totalRows: rows.length,
                    totalColumns: headers.length
                };
            })
            .catch(function(error) {
                console.error('Error converting Excel file:', error);
                if (callback) {
                    callback(null, null, error.message || error);
                }
                throw error;
            });
    }

    /**
     * Load ACVs_Municipality.xlsx and convert to arrays
     * @param {Function} callback - Optional callback function
     * @returns {Promise} - Promise that resolves with the data
     */
    function loadACVsData(callback) {
        var filePath = './layers/ACVs_Municipality.xlsx';
        return convertExcelToArrays(filePath, callback);
    }

    /**
     * Get headers from loaded data
     * @returns {Array} - Array of header names
     */
    function getHeaders() {
        return acvsHeaders.slice(); // Return a copy
    }

    /**
     * Get all rows from loaded data
     * @returns {Array} - Array of row arrays
     */
    function getRows() {
        return acvsRows.map(function(row) {
            return row.slice(); // Return copies
        });
    }

    /**
     * Get a specific row by index
     * @param {number} index - Row index (0-based)
     * @returns {Array|null} - Row array or null if not found
     */
    function getRow(index) {
        if (index >= 0 && index < acvsRows.length) {
            return acvsRows[index].slice();
        }
        return null;
    }

    /**
     * Get a specific column by header name
     * @param {string} headerName - Name of the header/column
     * @returns {Array} - Array of values in that column
     */
    function getColumn(headerName) {
        var headerIndex = acvsHeaders.indexOf(headerName);
        if (headerIndex === -1) {
            console.warn('Header not found:', headerName);
            return [];
        }
        
        return acvsRows.map(function(row) {
            return row[headerIndex] !== undefined ? row[headerIndex] : '';
        });
    }

    /**
     * Get data as array of objects (each row as an object with header keys)
     * @returns {Array} - Array of objects
     */
    function getDataAsObjects() {
        return acvsRows.map(function(row) {
            var obj = {};
            acvsHeaders.forEach(function(header, index) {
                obj[header] = row[index] !== undefined ? row[index] : '';
            });
            return obj;
        });
    }

    /**
     * Search rows by a specific column value
     * @param {string} headerName - Column name to search
     * @param {string|number} value - Value to search for
     * @returns {Array} - Array of matching row arrays
     */
    function searchByColumn(headerName, value) {
        var headerIndex = acvsHeaders.indexOf(headerName);
        if (headerIndex === -1) {
            console.warn('Header not found:', headerName);
            return [];
        }
        
        return acvsRows.filter(function(row) {
            var cellValue = row[headerIndex];
            // Case-insensitive string comparison
            if (typeof cellValue === 'string' && typeof value === 'string') {
                return cellValue.toLowerCase() === value.toLowerCase();
            }
            return cellValue === value;
        }).map(function(row) {
            return row.slice();
        });
    }

    /**
     * Get all data (headers and rows)
     * @returns {Object} - Object with headers and rows
     */
    function getAllData() {
        return {
            headers: acvsHeaders.slice(),
            rows: acvsRows.map(function(row) {
                return row.slice();
            }),
            totalRows: acvsRows.length,
            totalColumns: acvsHeaders.length
        };
    }

    /**
     * Check if data is loaded
     * @returns {boolean} - True if data is loaded
     */
    function isDataLoaded() {
        return acvsData !== null && acvsHeaders.length > 0;
    }

    // Expose functions to global scope
    window.ACVsExcelReader = {
        convertExcelToArrays: convertExcelToArrays,
        loadACVsData: loadACVsData,
        getHeaders: getHeaders,
        getRows: getRows,
        getRow: getRow,
        getColumn: getColumn,
        getDataAsObjects: getDataAsObjects,
        searchByColumn: searchByColumn,
        getAllData: getAllData,
        isDataLoaded: isDataLoaded
    };

    // Auto-load on initialization (optional - can be called manually)
    // Uncomment the following lines if you want to auto-load on page load
    /*
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                loadACVsData();
            }, 1000);
        });
    } else {
        setTimeout(function() {
            loadACVsData();
        }, 1000);
    }
    */

    console.log('ACVs Excel Reader initialized. Use ACVsExcelReader.loadACVsData() to load the file.');
})();

