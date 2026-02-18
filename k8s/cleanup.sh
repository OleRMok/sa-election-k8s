#!/bin/bash
set -e

echo "  Cleaning up SA Election Platform from Kubernetes..."
echo ""

CONTEXT=$(kubectl config current-context)
echo " Current context: $CONTEXT"
echo ""

read -p "Delete all resources from $CONTEXT? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled..."
    exit 0
fi

echo ""
echo "Deleting all resources in election namespace..."
kubectl delete -f frontend/ --ignore-not-found=true
kubectl delete -f backend/ --ignore-not-found=true
kubectl delete -f redis/ --ignore-not-found=true
kubectl delete -f base/ --ignore-not-found=true

echo ""
echo "Deleting namespace..."
kubectl delete namespace election --ignore-not-found=true

echo ""
echo " Cleanup complete"
