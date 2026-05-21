#!/bin/bash
#
# IT Software Development Portal - Setup Script
# 
# This script configures the portal for a new GitHub organization or user account.
# It updates all references, URLs, and configurations to match the new owner.
#
# Usage: bash setup-portal.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "============================================="
echo "  IT Development Portal - Setup Wizard"
echo "============================================="
echo ""

# --- Gather Configuration ---

read -p "Enter your GitHub username or organization name: " GITHUB_OWNER
if [ -z "$GITHUB_OWNER" ]; then
    echo "ERROR: GitHub owner is required."
    exit 1
fi

read -p "Enter repository name (default: github-pages): " REPO_NAME
REPO_NAME=${REPO_NAME:-github-pages}

read -p "Is '$GITHUB_OWNER' a user or organization? (user/org, default: org): " OWNER_TYPE
OWNER_TYPE=${OWNER_TYPE:-org}

read -p "Enter GitHub Project board URL (leave blank to skip): " PROJECT_URL

read -p "Enter Uptime Kuma URL (e.g., https://kuma.example.com, leave blank to skip): " KUMA_URL

read -p "Enter department name (default: IT Software Development): " DEPARTMENT_NAME
DEPARTMENT_NAME=${DEPARTMENT_NAME:-IT Software Development}

PORTAL_URL="https://$GITHUB_OWNER.github.io/$REPO_NAME/"

echo ""
echo "--- Configuration Summary ---"
echo "  GitHub Owner:    $GITHUB_OWNER"
echo "  Repository:      $REPO_NAME"
echo "  Owner Type:      $OWNER_TYPE"
echo "  Portal URL:      $PORTAL_URL"
echo "  Project Board:   ${PROJECT_URL:-(none)}"
echo "  Uptime Kuma:     ${KUMA_URL:-(none)}"
echo "  Department:      $DEPARTMENT_NAME"
echo ""

read -p "Proceed with setup? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "[1/5] Updating _config.yml..."

# --- Update _config.yml ---
CONFIG_FILE="$SCRIPT_DIR/_config.yml"
if [ -f "$CONFIG_FILE" ]; then
    sed -i.bak "s|baseurl: \"[^\"]*\"|baseurl: \"/$REPO_NAME\"|g" "$CONFIG_FILE"
    sed -i.bak "s|url: \"[^\"]*\"|url: \"https://$GITHUB_OWNER.github.io\"|g" "$CONFIG_FILE"
    sed -i.bak "s|title: \"[^\"]*\"|title: \"$DEPARTMENT_NAME Portal\"|g" "$CONFIG_FILE"
    rm -f "$CONFIG_FILE.bak"
    echo "  Updated _config.yml"
else
    echo "  WARNING: _config.yml not found"
fi

echo "[2/5] Updating index.md..."

# --- Update index.md ---
INDEX_FILE="$SCRIPT_DIR/index.md"
if [ -f "$INDEX_FILE" ]; then
    sed -i.bak "s|IT Software Development Portal|$DEPARTMENT_NAME Portal|g" "$INDEX_FILE"
    if [ -n "$PROJECT_URL" ]; then
        sed -i.bak "s|https://github.com/users/fahmiyuda31/projects/7|$PROJECT_URL|g" "$INDEX_FILE"
    fi
    rm -f "$INDEX_FILE.bak"
    echo "  Updated index.md"
else
    echo "  WARNING: index.md not found"
fi

echo "[3/5] Updating monitoring.md..."

# --- Update monitoring.md ---
MONITORING_FILE="$SCRIPT_DIR/monitoring.md"
if [ -f "$MONITORING_FILE" ]; then
    if [ -n "$KUMA_URL" ]; then
        sed -i.bak "s|https://kuma.ravelware.cloud/|$KUMA_URL|g" "$MONITORING_FILE"
        sed -i.bak "s|https://kuma.ravelware.cloud|$KUMA_URL|g" "$MONITORING_FILE"
        rm -f "$MONITORING_FILE.bak"
        echo "  Updated monitoring.md with $KUMA_URL"
    else
        echo "  Skipped (no Kuma URL provided)"
    fi
else
    echo "  WARNING: monitoring.md not found"
fi

echo "[4/5] Updating app documents..."

# --- Update _apps/*.md ---
APPS_DIR="$SCRIPT_DIR/_apps"
if [ -d "$APPS_DIR" ]; then
    for file in "$APPS_DIR"/*.md; do
        if [ -f "$file" ]; then
            sed -i.bak "s|Fyudaz-Apps|$GITHUB_OWNER|g" "$file"
            sed -i.bak "s|https://github.com/Fyudaz-Apps/|https://github.com/$GITHUB_OWNER/|g" "$file"
            sed -i.bak "s|https://github.com/PT-Ravelware-Technology-Indonesia/|https://github.com/$GITHUB_OWNER/|g" "$file"
            if [ -n "$PROJECT_URL" ]; then
                sed -i.bak "s|https://github.com/users/fahmiyuda31/projects/7|$PROJECT_URL|g" "$file"
            fi
            rm -f "$file.bak"
            echo "  Updated $(basename "$file")"
        fi
    done
else
    echo "  WARNING: _apps/ directory not found"
fi

echo "[5/5] Checking deploy workflow..."

WORKFLOW_FILE="$SCRIPT_DIR/.github/workflows/deploy.yml"
if [ -f "$WORKFLOW_FILE" ]; then
    echo "  deploy.yml exists (no changes needed)"
else
    echo "  WARNING: .github/workflows/deploy.yml not found"
fi

echo ""
echo "============================================="
echo "  Setup Complete!"
echo "============================================="
echo ""
echo "Next Steps:"
echo ""
echo "  1. Create a new repository on GitHub:"
echo "     https://github.com/new"
echo "     Name: $REPO_NAME"
echo ""
echo "  2. Push this repo to your account:"
echo "     git remote set-url origin https://github.com/$GITHUB_OWNER/$REPO_NAME.git"
echo "     git push -u origin master"
echo ""
echo "  3. Enable GitHub Pages:"
echo "     Go to: https://github.com/$GITHUB_OWNER/$REPO_NAME/settings/pages"
echo "     Source: GitHub Actions"
echo ""
echo "  4. Your portal will be live at:"
echo "     $PORTAL_URL"
echo ""
echo "  5. Customize further:"
echo "     - Edit _sop/*.md to add your SOPs"
echo "     - Edit _apps/*.md to add your app docs"
echo "     - Edit assets/css/style.css to change branding"
echo ""
