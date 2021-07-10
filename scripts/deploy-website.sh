#!/bin/bash

set -e

root_dir="$(dirname "$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)")"
tmp_dir="/tmp/reach.tech"

# Clone reacttraining.com repo into the tmp dir
rm -rf $tmp_dir
git clone --depth 2 --branch master "git@github.com:reach/reach.tech.git" $tmp_dir

# Build the website into the public dir
rm -rf "$tmp_dir/public"
cd "$root_dir/website"
yarn
yarn build
mv public "$tmp_dir/public"

# Commit all changes
cd $tmp_dir
git add -A
git commit \
  --allow-empty \
  --author "Travis CI <travis-ci@reacttraining.com>" \ # "CI <ci@reacttraining.com>" \
  -m "Update reach-ui website

https://travis-ci.com/$TRAVIS_REPO_SLUG/builds/$TRAVIS_BUILD_ID" # $GITHUB_SERVER_URL/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"

# Deploy
git push origin master
