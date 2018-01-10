#!/usr/bin/env bash
set -e
latestVersion=`git describe`
mkdir -p artifacts
cd frontend
yarn
yarn build
mv build/ sefilm/
apack ../artifacts/frontend-$latestVersion.tar.gz sefilm/
rm -r sefilm/

cd ../backend
./gradlew clean build
cp build/libs/*.jar ../artifacts/
