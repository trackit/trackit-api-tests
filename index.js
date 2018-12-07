const newman = require('newman');
const replace = require("replace");
const { WebClient } = require('@slack/client');

const apiUrl = process.env.TRACKIT_API_URL;
const username = process.env.TRACKIT_USERNAME;
const password = process.env.TRACKIT_PASSWORD;
const responseTime = process.env.TRACKIT_RT || 3000;
const tagKey = process.env.TRACKIT_TAG_KEY || 'Name';
const slack_token = process.env.SLACK_TOKEN;
const slack_channel = process.env.SLACK_CHANNEL;
const slack_active = slack_token && slack_channel;

let slack_client;
if (slack_active) {
    slack_client = new WebClient(slack_token);
}

const fillTemplate = (apiUrl, username, password) => {
    replace({
        regex: "<api_url>",
        replacement: apiUrl,
        paths: ['./env_template.json'],
        recursive: true,
        silent: true,
    });
    replace({
        regex: "<username>",
        replacement: username,
        paths: ['./env_template.json'],
        recursive: true,
        silent: true,
    });
    replace({
        regex: "<password>",
        replacement: password,
        paths: ['./env_template.json'],
        recursive: true,
        silent: true,
    });
    replace({
        regex: "<rt>",
        replacement: responseTime,
        paths: ['./env_template.json'],
        recursive: true,
        silent: true,
    });
    replace({
        regex: "<tagKey>",
        replacement: tagKey,
        paths: ['./env_template.json'],
        recursive: true,
        silent: true,
    });

};


if (apiUrl && username && password) {
    fillTemplate(apiUrl, username, password);

    newman.run({
        collection: require('./postman_collection.json'),
        environment: require('./env_template.json'),
        delayRequest: 500,
        reporters: 'cli'
    }, function (err, summary) {
        if (err) {
            throw err;
        }

        // Some tests failed
        if (summary.run.failures && summary.run.failures.length) {
            // Slack is active
            if (slack_active) {
                const promises = [];
                summary.run.failures.forEach(element => {
                    const method = element.source.request.method;
                    const endpoint = element.source.name;
                    const test = element.error.test;
                    const message = element.error.message;
                    const messageString = `[*Test failed at ${method} ${apiUrl}${endpoint} *] \n*Test:* ${test} \n\`${message}\``;
                    
                    promises.push(slack_client.chat.postMessage({
                        channel: slack_channel,
                        text: messageString
                    }));
                });
                Promise.all(promises)
                .then(() => {
                    console.log('Collection run complete with errors!');
                    process.exit(1);
                }).catch(err => {
                    console.log(err);
                });
            } else {
                process.exit(1);
            }
        } else {
            console.log('Collection run complete!');
            process.exit(0);    
        }
    });
} else {
    console.log('Missing env variables. Exiting.')
    process.exit(1);
}