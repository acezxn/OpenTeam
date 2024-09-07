
const functions = require('firebase-functions');
const { google } = require('googleapis');

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;

exports.handleBillingAlert = functions.pubsub.topic('budget-topic').onPublish(async (message) => {
    const pubsubData = JSON.parse(Buffer.from(message.data, 'base64').toString());
	const { cost, budget } = pubsubData;

    if (budget < cost) {
        console.log('Spending threshold exceeded. Taking action...');
        try {
            // Detach from the billing account
            await google.cloudresourcemanager('v1').projects.updateBillingInfo({
                name: `projects/${PROJECT_ID}`,
                resource: {
                    billingAccountName: null,
                },
            });
            console.log('Billing disabled for project:', PROJECT_ID);
        } catch (error) {
            console.error('Error disabling billing:', error);
        }
    } else {
        console.log('No action needed for this alert.');
    }
});