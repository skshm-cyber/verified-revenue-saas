#!/bin/bash

# Test script to verify the ownership detection is working correctly

echo "===== Testing Company Ownership Detection ====="
echo ""

# Test 1: Get companies list
echo "1. Fetching companies list..."
curl -s http://localhost:8000/api/revenue/companies/ | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'Total companies: {len(data)}')
print('')
print('Companies with added_by_username:')
for c in data[:5]:
    print(f\"  - {c['name']}: added_by_username={c.get('added_by_username')}, founder_name={c.get('founder_name')}\")
"

echo ""
echo "2. To test ownership:"
echo "   - Log in to http://localhost:5173 with username 'ram'"
echo "   - Navigate to 'Test 3' company profile"
echo "   - Open browser console (F12)"
echo "   - Look for logs starting with 🔍 and check if 'shouldShowButton' is true"
echo "   - The 'Edit / Delete' button should appear"
echo ""
echo "If button doesn't appear, check console logs for:"
echo "  - Username from token"
echo "  - Company added_by_username"
echo "  - Company founder_name"
echo "  - shouldShowButton value"
