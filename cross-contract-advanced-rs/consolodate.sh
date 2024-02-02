#!/usr/bin/env bash

repo=$1
remotename=$2
branch=$3

git remote add $remotename $repo
git fetch $remotename

echo "now do git merge on the master or main "

git merge remotes/$remotename/$branch --allow-unrelated-histories

mkdir $remotename