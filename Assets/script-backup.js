document.getElementById('figmaForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const figmaToken = document.getElementById('figmaToken').value.trim();
    const fileId = document.getElementById('fileId').value.trim();

    if (!figmaToken || !fileId) {
        alert('Please enter both Figma API Token and File ID');
        return;
    }

    const baseUrl = `https://api.figma.com/v1/files/${fileId}`;
    const headers = { "X-Figma-Token": figmaToken };

    try {
        const response = await fetch(baseUrl, { headers });
        const data = await response.json();

        if (response.ok) {
            // Process and display the results
            const fileName = data.name || "Unknown";
            const lastUpdate = data.lastModified || "Unknown";
            let totalComponentSets = 0;
            let totalComponents = 0;
            const componentSetsList = [];

            // Recursively search for components and component sets
            function findComponents(nodes) {
                nodes.forEach(node => {
                    if (node.type === "COMPONENT_SET") {
                        totalComponentSets++;
                        componentSetsList.push({ name: node.name, node_id: node.id });
                    } else if (node.type === "COMPONENT") {
                        totalComponents++;
                    }

                    // Recursively check children nodes
                    if (node.children) {
                        findComponents(node.children);
                    }
                });
            }

            findComponents(data.document.children);

            // Display the results
            let resultHTML = `
                <div id=resBox>
                    <h3>Figma File Information:</h3>
                    <p><strong>File:</strong> ${fileName}</p>
                    <p><strong>File ID:</strong> ${fileId}</p>
                    <p><strong>Last Update:</strong> ${lastUpdate}</p>
                    <p><strong>Total Component-Sets:</strong> ${totalComponentSets}</p>
                    <p><strong>Total Components:</strong> ${totalComponents}</p>
                    <h3>List of Component Sets:</h3>
                    <ul>
                
            `;

            componentSetsList.forEach(item => {
                resultHTML += `<li>${item.name} (Node ID: ${item.node_id})</li>`;
            });

            resultHTML += '</ul></div>';

            document.getElementById('results').innerHTML = resultHTML;

            // Optionally, download the JSON data
            const outputData = {
                file_name: fileName,
                file_id: fileId,
                last_update: lastUpdate,
                total_component_sets: totalComponentSets,
                total_components: totalComponents,
                component_sets: componentSetsList
            };

            const jsonBlob = new Blob([JSON.stringify(outputData, null, 2)], { type: 'application/json' });
            const jsonUrl = URL.createObjectURL(jsonBlob);
            const downloadLink = document.createElement('a');
            downloadLink.setAttribute("id", "butt")
            downloadLink.href = jsonUrl;
            downloadLink.download = 'figma_data.json';
            downloadLink.innerText = 'Download Data as JSON';
            document.getElementById('results').appendChild(downloadLink);

        } else {
            document.getElementById('results').innerHTML = `<p style="color: red;">❌ Error fetching data: ${data.status_text || 'Unknown Error'}</p>`;
        }
    } catch (error) {
        document.getElementById('results').innerHTML = `<p style="color: red;">❌ Error fetching data: ${error.message}</p>`;
    }
});