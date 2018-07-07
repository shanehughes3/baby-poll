#!/bin/bash
aws s3 sync ./ s3://baby-poll-public --exclude deploy.sh --delete --acl public-read --cache-control max-age=3600
