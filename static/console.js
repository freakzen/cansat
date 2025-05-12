document.addEventListener('DOMContentLoaded', function() {
    const consoleOutput = document.getElementById('console-output');

    function updateConsole() {
        fetch('/api/data')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    consoleOutput.textContent = 'Error: ' + data.error;
                    return;
                }

                // Filter out irrelevant fields (modify as needed)
                const relevantFields = [
                    'timestamp', 'temperature', 'pressure', 'altitude', 
                    'humidity', 'speed', 'latitude', 'longitude',
                    'accel_x', 'accel_y', 'accel_z',
                    'gyro_x', 'gyro_y', 'gyro_z'
                ];

                // Format the data as a table with only relevant fields
                let output = '';
                if (data.length > 0) {
                    // Filter and get header row
                    const headers = Object.keys(data[0])
                        .filter(key => relevantFields.includes(key));
                    output += headers.join('\t') + '\n';
                    
                    // Data rows with only relevant fields
                    data.forEach(row => {
                        const filteredRow = headers.map(header => row[header] || 'N/A');
                        output += filteredRow.join('\t') + '\n';
                    });
                }
                
                consoleOutput.textContent = output;
            })
            .catch(error => {
                consoleOutput.textContent = 'Error fetching data: ' + error;
            });
    }

    updateConsole();
    setInterval(updateConsole, 3000);
});