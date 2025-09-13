#!/usr/bin/env python3
"""
Script to generate organization activity report for the last 4 months.
This script collects contributors from all linksplatform repositories (excluding specified ones)
and generates a sorted list of contributors who have been active.
"""

import subprocess
import json
import sys
from datetime import datetime, timedelta
from collections import defaultdict


def run_gh_command(cmd):
    """Run a GitHub CLI command and return the output."""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {cmd}")
        print(f"Error: {e.stderr}")
        return None


def get_repos():
    """Get all repositories from linksplatform organization excluding ignored ones."""
    print("Fetching linksplatform repositories...")
    cmd = 'gh search repos --owner linksplatform --limit 100 --json name,pushedAt'
    result = run_gh_command(cmd)
    if not result:
        return []
    
    repos = json.loads(result)
    # Filter out ignored repositories
    ignored_repos = ['conan-center-index', 'Sigil']
    filtered_repos = [repo for repo in repos if repo['name'] not in ignored_repos]
    
    print(f"Found {len(filtered_repos)} repositories (excluding ignored repos)")
    return filtered_repos


def get_contributors_last_4_months(repo_name):
    """Get contributors for a specific repository in the last 4 months."""
    # Calculate date 4 months ago
    four_months_ago = datetime.now() - timedelta(days=120)  # Approximately 4 months
    since_date = four_months_ago.strftime('%Y-%m-%d')
    
    print(f"Checking contributors for {repo_name} since {since_date}...")
    
    # Get commits from the last 4 months
    cmd = f'gh api repos/linksplatform/{repo_name}/commits --paginate --jq \'.[].author.login\' --field since={since_date}T00:00:00Z'
    result = run_gh_command(cmd)
    
    if not result:
        return set()
    
    # Filter out null results and bots, return unique contributors
    contributors = set()
    for line in result.split('\n'):
        line = line.strip()
        if line and line != 'null' and not line.endswith('[bot]'):
            contributors.add(line)
    
    return contributors


def main():
    print("Starting organization activity report generation...")
    print("=" * 60)
    
    # Get all repositories
    repos = get_repos()
    if not repos:
        print("No repositories found!")
        return
    
    # Collect all contributors from all repositories
    all_contributors = set()
    
    for repo in repos:
        repo_name = repo['name']
        contributors = get_contributors_last_4_months(repo_name)
        if contributors:
            print(f"  Found {len(contributors)} contributors in {repo_name}")
            all_contributors.update(contributors)
        else:
            print(f"  No recent contributors in {repo_name}")
    
    print("\n" + "=" * 60)
    print(f"Total unique contributors in last 4 months: {len(all_contributors)}")
    print("=" * 60)
    
    # Sort contributors alphabetically
    sorted_contributors = sorted(all_contributors, key=str.lower)
    
    # Print the result
    print("\nOrganization last 4 month activity:")
    for contributor in sorted_contributors:
        print(contributor)
    
    # Also save to file
    with open('/tmp/gh-issue-solver-1757758918790/activity_report.txt', 'w') as f:
        f.write("Organization last 4 month activity:\n")
        for contributor in sorted_contributors:
            f.write(f"{contributor}\n")
    
    print(f"\nReport saved to activity_report.txt")


if __name__ == "__main__":
    main()