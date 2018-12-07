# TrackIt API Tests suite

This is the test suite for TrackIt API testing.
It runs Postman tests using the newman CLI through a nodeJS app.

It can also send Slack notifications when a test fails.

## Usage

The easiest way of running the test suite is through docker.

### Building the container
```sh
docker build -t trackit-api-tests .
```


### Running the test suite

The script that runs the tests needs some informations to run the test suite properly. You can pass these infos through docker environment variables.

Here is a list of the available env variables : 

  - **TRACKIT_API_URL** (required) : API URL to target, example : `https://api.re.trackit.io`
  - **TRACKIT_USERNAME** (required) : TrackIt Username the test suite will use (usually an email address)
  - **TRACKIT_PASSWORD** (required) : Password associated with the username
  - **TRACKIT_RT** (default : 3000) : Maximum allowed response time in ms
  - **TRACKIT_TAG_KEY** (default: 'Name'): Tag key to use for tag related endpoint tests
 
If you want to enable the Slack notifications you can add the two following env variables :

  - **SLACK_CHANNEL** : Channel Id on which the notifications will be posted
  - **SLACK_TOKEN** : Slack API Token (see Slack documentation for more details)

You can then launch the test suite :
```sh
docker run -e TRACKIT_API_URL=<api_url> -e TRACKIT_USERNAME=<username> -e TRACKIT_PASSWORD="<password>" trackit-api-tests `
```