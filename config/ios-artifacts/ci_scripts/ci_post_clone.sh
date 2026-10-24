#!/bin/zsh
set -e
set -x

if [[ -n "$CI_PRIMARY_REPOSITORY_PATH" ]]; then
	REPO_ROOT="$CI_PRIMARY_REPOSITORY_PATH"
elif [[ -f "$(dirname "$0")/../../../package.json" ]]; then
	REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
elif [[ -f "$(dirname "$0")/../../package.json" ]]; then
	REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
else
	REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
fi
cd "$REPO_ROOT"

CI_TOOLS="${CI_DERIVED_DATA_PATH:-/tmp}/hawconnect-ci-tools"
mkdir -p "$CI_TOOLS"

if ! command -v node >/dev/null; then
	NODE_DIR=node-v22.14.0-darwin-$([[ "$(uname -m)" == arm64 ]] && echo arm64 || echo x64)
	curl -fsSL "https://nodejs.org/dist/v22.14.0/${NODE_DIR}.tar.gz" | tar -xz -C "$CI_TOOLS"
	export PATH="$CI_TOOLS/$NODE_DIR/bin:$PATH"
fi

if ! command -v bun >/dev/null; then
	export BUN_INSTALL="$CI_TOOLS/bun" BUN_VERSION="$(cat .bun-version)"
	curl -fsSL https://bun.sh/install | bash
	export PATH="$BUN_INSTALL/bin:$PATH"
fi

export NODE_BINARY="$(command -v node)"

echo "===== Running bun install ====="
bun install --frozen-lockfile --ignore-scripts

echo "===== Updating license list ====="
bun run licences:bundle

echo "===== Running expo prebuild ====="
bunx expo prebuild -p ios

echo "export NODE_BINARY=\"$NODE_BINARY\"" > ios/.xcode.env

echo "===== Running pod install ====="
cd ios
pod install

echo "===== Resolving Swift package dependencies ====="
# Xcode Cloud disables automatic SPM resolution; allow resolve to generate Package.resolved.
defaults delete com.apple.dt.Xcode IDEPackageOnlyUseVersionsFromResolvedFile 2>/dev/null || true
defaults delete com.apple.dt.Xcode IDEDisableAutomaticPackageResolution 2>/dev/null || true
if [[ -n "${IOS_WORKSPACE:-}" ]]; then
	workspace_path="$IOS_WORKSPACE"
else
	workspace_paths=( *.xcworkspace(N) )
	if (( ${#workspace_paths} != 1 )); then
		echo "Expected one generated iOS workspace; configure IOS_WORKSPACE and IOS_SCHEME for custom projects."
		exit 1
	fi
	workspace_path="${workspace_paths[1]}"
fi
workspace_scheme="${IOS_SCHEME:-${workspace_path%.xcworkspace}}"
xcodebuild -resolvePackageDependencies \
	-workspace "$workspace_path" \
	-scheme "$workspace_scheme"
