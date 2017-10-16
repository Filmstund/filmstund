#!/usr/bin/env bash
set -e
mkdir -p artifacts
cd frontend
yarn
yarn build
apack ../artifacts/frontend.tar.gz build/
rm -r build/

cd ../backend
./gradlew clean build
cp build/libs/*.jar ../artifacts/
