# !! You most likely do not need to touch anything in this folder !!

# Staging CDK Stack

CDK stack template that is deployed by Github actions for a specific pull request.
The URL for a deployed site is `staging-{pr_num}.antalmanac.com`.

Relevant deployed infrastructure:
- S3 bucket containing website code
- Cloudfront Distribution that redirects staging URL to bucket
