const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Route to serve tools.html
app.get('/tools.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'tools.html'));
});

// Route to get tools data
app.get('/api/tools', (req, res) => {
    fs.readFile('tools.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading tools data:', err);
            res.status(500).send('Error reading tools data');
            return;
        }
        res.json(JSON.parse(data));
    });
});

// Route to save tools data
app.post('/api/tools', (req, res) => {
    const newTools = req.body;
    fs.writeFile('tools.json', JSON.stringify(newTools, null, 2), (err) => {
        if (err) {
            console.error('Error saving tools data:', err);
            res.status(500).send('Error saving tools data');
            return;
        }
        res.status(200).send('Tools data saved successfully');
    });
});

// Route to update a specific tool based on toolID
app.post('/api/update-tool', (req, res) => {
    const updatedTool = req.body;
    console.log("Tool ID to update:", updatedTool.toolID); // Log the Tool ID for debugging

    fs.readFile('tools.json', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading tools data:", err);
            return res.status(500).send('Error reading tools data');
        }

        let tools = JSON.parse(data);
        const toolIndex = tools.findIndex(tool => tool.toolID === updatedTool.toolID);

        if (toolIndex !== -1) {
            // Only update fields that have new data entered
            tools[toolIndex] = {
                ...tools[toolIndex], // Keep existing data
                ...(updatedTool.toolName ? { toolName: updatedTool.toolName } : {}),
                ...(updatedTool.machineID ? { machineID: updatedTool.machineID } : {}),
                ...(updatedTool.expirationDate ? { expirationDate: updatedTool.expirationDate } : {})
            };

            fs.writeFile('tools.json', JSON.stringify(tools, null, 2), (err) => {
                if (err) {
                    console.error("Error updating tools data:", err);
                    return res.status(500).send('Error updating tools data');
                }
                res.json({ message: 'Tool updated successfully' });
            });
        } else {
            console.log("Tool not found for ID:", updatedTool.toolID); // Log if tool isn't found
            res.status(404).json({ message: 'Tool not found' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
