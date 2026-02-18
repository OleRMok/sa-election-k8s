#!/bin/bash
set -e

echo " Deploying SA Election Platform to Kubernetes..."
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo " kubectl not found. Please install kubectl first."
    exit 1
fi

# Check current context
CONTEXT=$(kubectl config current-context)
echo " Current context: $CONTEXT"
echo ""

# Confirm deployment
read -p "Deploy to $CONTEXT? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "Step 1: Creating namespace..."
kubectl apply -f base/namespace.yaml

echo ""
echo "Step 2: Creating secrets and config..."
kubectl apply -f base/secret.yaml
kubectl apply -f base/configmap.yaml

echo ""
echo "Step 3: Deploying Redis..."
kubectl apply -f redis/

echo ""
echo "Step 4: Waiting for Redis to be ready..."
kubectl wait --for=condition=ready pod -l app=redis -n election --timeout=120s

echo ""
echo "Step 5: Deploying Backend..."
kubectl apply -f backend/

echo ""
echo "Step 6: Deploying Frontend..."
kubectl apply -f frontend/

echo ""
echo " Deployment complete!"
echo ""
echo " Checking status..."
kubectl get all -n election

echo ""
echo " Getting frontend URL..."
echo "Waiting for LoadBalancer IP..."
kubectl get svc frontend-service -n election -w
