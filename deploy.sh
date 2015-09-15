#!/bin/bash
set -e # exit with nonzero exit code if anything fails
git push --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1