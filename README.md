# Merge Reminders for Slack
A basic Lambda function to read the GitLab API to find open merge requests and announce for the #zsp-frontend Slack channel.

## Setup

Make sure you fill in the configuration parameters

```
const params = {
    gitlab_access_token: '',
    gitlab_project: '',
    slack_hook: ''
};
```

Also update the Gitlab domian - `gitlab.example.co.uk`

## Deployment

Simply create a ZIP of this function, with its dependencies, and upload it to the Lambda.

```bash
$ cd merge-reminders
$ zip -r function.zip .
```

A CloudWatch event rule uses a cron expression to trigger the Lambda every morning at 8am (GMT).
