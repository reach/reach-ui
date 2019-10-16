#!/bin/bash

set -e

root_dir="$(dirname "$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)")"
tmp_dir="/tmp/reacttraining.com"

# Clone reacttraining.com repo into the tmp dir
rm -rf $tmp_dir
git clone --depth 2 --branch master "git@github.com:ReactTraining/reacttraining.com.git" $tmp_dir

# Build the website into the static/react-router dir
rm -rf "$tmp_dir/static/reach-ui"
cd "$root_dir/website"
yarn
yarn build --prefix-paths
mv public "$tmp_dir/static/reach-ui"

# Commit all changes
cd $tmp_dir
git add -A
git commit \
  --allow-empty \
  --author "Travis CI <travis-ci@reacttraining.com>" \
  -m "Update reach-ui website

https://travis-ci.org/$TRAVIS_REPO_SLUG/builds/$TRAVIS_BUILD_ID"

# Deploy
git push origin master
