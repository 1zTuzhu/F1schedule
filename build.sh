#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building Vue app..."
npm run build

echo "Build completed successfully!"
