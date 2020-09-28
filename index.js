const fetch = require( 'node-fetch' );
const { formatDistance, subDays } = require( 'date-fns' );

/* TODO: should not be hardcoded.
    - access token could go in secrets manager
    - group and slack hook to come from Slack API (settings)
*/
const params = {
    gitlab_access_token: '',
    gitlab_project: '',
    slack_hook: ''
};

// Format API timestamp into 'days ago'
const formatTime = ( date ) => { 
    return formatDistance( subDays( new Date( date ), 0 ), new Date(), { 
        addSuffix: true
    });
}

// Strip project ID from reference
const getApplication = ( project ) => {
    return project.substr( 0, project.indexOf('!') );
}

// Fetch the data from GitLab API and parse it ready for Slack
const gitlabAPI = async () => {
    
    let reponse = await fetch( `https://gitlab.example.co.uk/api/v4/projects/${params.gitlab_project}/merge_requests?state=opened&access_token=${params.gitlab_access_token}` );
    let data = await reponse.json();
    
    // Create object used by Slack API
    const slack = {};
    slack.blocks = [];

    if ( data.length === 0 ) {
        let section = {};
        section.type = 'section';
        section.text = {
            type: 'mrkdwn',
            text: 'You have no open Merge Requests today. Great job!'
        }
        slack.blocks.push( section );
    } else {
        data.forEach( item => {
            let section = {};
            section.type = 'section';
            section.text = {
                type: 'mrkdwn',
                text: `*[${getApplication( item.references.full )}]* <${item.web_url}|${item.title}>\n${formatTime( item.created_at )} by ${item.author.username}`
            }

            // Adds items in reverse order (oldest will be first)
            slack.blocks.unshift( section );
        });
    }

    return slack;
};

exports.handler = async ( event ) => {

    // Grab GitLab data to use with Slack
    let message = await gitlabAPI();
    let response = '';

    // If triggered via cron then we need to POST to Slack
    if ( event.source === 'aws.events' ) {
        response = await fetch( params.slack_hook, {
            method: 'POST',
            body: JSON.stringify( message ),
            headers: { 'Content-Type': 'application/json' }
        });
    } else {
        response = {
            statusCode: 200,
            body: JSON.stringify( message )
        };
    }

    return response;

};