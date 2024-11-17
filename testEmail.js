const nodemailer = require('nodemailer');
const cron = require('node-cron');
const fs = require('fs');

// Configure the transporter for iCloud
const transporter = nodemailer.createTransport({
    service: 'iCloud',
    auth: {
        user: 'jadensittig@icloud.com', // Your iCloud email
        pass: 'muua-mnkv-zrni-lqen' // Your app-specific password
    }
});

// Function to send an expiration notification email
async function sendExpirationNotification(tool, weeksRemaining) {
    const mailOptions = {
        from: 'jadensittig@icloud.com',
        to: 'jadensittig@icloud.com', // Sending to your own email for testing
        subject: `Tool Expiration Alert: ${tool.name} on Machine ${tool.machine}`,
        text: `Attention:

The following tool is due to expire in ${weeksRemaining} week(s):

- Tool Name: ${tool.name}
- Tool ID: ${tool.id}
- Machine ID: ${tool.machine}
- Expiration Date: ${tool.expiration}

Please check and calibrate as needed.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Expiration notification sent for ${tool.name} with ${weeksRemaining} week(s) remaining.`);
    } catch (error) {
        console.error('Error sending expiration notification:', error);
    }
}

// Function to check expiration dates at multiple intervals
function checkToolExpirations() {
    try {
        // Load tools from tools.json file
        const tools = JSON.parse(fs.readFileSync('tools.json', 'utf8'));

        const today = new Date();
        const intervals = [4, 3, 2, 1]; // Weeks before expiration to send notifications

        tools.forEach(tool => {
            const expirationDate = new Date(tool.expiration);
            const timeDiff = expirationDate - today;
            const daysToExpire = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            const weeksToExpire = Math.ceil(daysToExpire / 7);

            if (intervals.includes(weeksToExpire)) {
                sendExpirationNotification(tool, weeksToExpire);
            }
        });
    } catch (error) {
        console.error('Error checking tool expirations:', error);
    }
}

// Schedule the expiration check to run every day at 3:30 a.m. and 3:30 p.m.
cron.schedule('30 3 * * *', () => {
    console.log('Running scheduled expiration check at 3:30 a.m.');
    checkToolExpirations();
});

cron.schedule('30 15 * * *', () => {
    console.log('Running scheduled expiration check at 3:30 p.m.');
    checkToolExpirations();
});

// Function to update tool expiration (if manual updates are needed)
function updateToolExpiration(toolId, newExpirationDate) {
    try {
        // Load tools from tools.json file
        const tools = JSON.parse(fs.readFileSync('tools.json', 'utf8'));

        // Find the tool to update
        const tool = tools.find(t => t.id === toolId);
        if (tool) {
            tool.expiration = newExpirationDate;

            // Save updated tools back to the file
            fs.writeFileSync('tools.json', JSON.stringify(tools, null, 2));
            console.log(`Updated expiration date for tool ${tool.name} (${tool.id}) to ${newExpirationDate}.`);
        } else {
            console.error('Tool not found.');
        }
    } catch (error) {
        console.error('Error updating tool expiration:', error);
    }
}

// Example of manual update (for reference, not part of the scheduled process)
// Uncomment to test manual updates
// updateToolExpiration('001', '2024-12-31');
