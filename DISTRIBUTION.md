# Distribution Guide

This guide describes how to publish and distribute the **MicroPng** CLI tool.

## Prerequisites

-   An **NPM** account (`npmjs.com`).
-   Access to the package name (if already published).

## Local Testing

Before publishing to NPM, you can test the CLI tool locally using several methods:

### 1. NPM Link (Recommended)
This makes the `micropng` command available globally on your machine, pointing to your local development folder.

```bash
# In the project root
npm run build
npm link

# Now you can use it anywhere
micropng --help
```

To remove the link:
```bash
npm unlink -g micropng-cli
```

### 2. Global Install from Path
Similar to `npm link`, but performs a full "install" of the local folder.

```bash
npm run build
npm install -g .
```

### 3. Direct Execution with NPX
Run the local version without installing it globally.

```bash
npm run build
npx . --help
```

### 4. Direct Node Execution
Useful for debugging specific scripts in `dist/`.

```bash
npm run build
node ./dist/index.js --help
```

## Publishing to NPM

1.  **Login to NPM**
    If you haven't logged in on your machine yet:
    ```bash
    npm login
    ```

2.  **Update Version**
    Update the version number in `package.json` following Semantic Versioning (semver):
    ```bash
    npm version patch # or minor, major
    ```

3.  **Build the Project**
    Ensure the `dist` folder is up-to-date. The `prepublishOnly` script in `package.json` handles this automatically, but you can run it manually:
    ```bash
    npm run build
    ```

4.  **Publish**
    Publish the package to the NPM registry:
    ```bash
    npm publish --access public
    ```

## verifying Distribution

After publishing, verify that the package is accessible:

1.  **Check NPM Page**: Go to `https://www.npmjs.com/package/micropng-cli`.
2.  **Test Installation**:
    ```bash
    npm install -g micropng-cli
    micropng-cli --version
    ```
3.  **Test NPX**:
    ```bash
    npx micropng-cli --help
    ```

## Automating with GitHub Actions

The distribution process is automated using GitHub Actions. The workflow is defined in `.github/workflows/release.yml`.

### Workflow Features

1.  **Continuous Integration**: Runs `npm test` on every push to `master` and all Pull Requests.
2.  **Automated Publishing**: When you create a new **GitHub Release**, the workflow will:
    -   Run tests.
    -   Publish the package to **NPM**.
    -   Build standalone binaries.
    -   Attach the binaries to the GitHub Release.

### Setup Instructions

To enable automated publishing, follow these steps:

1.  **Generate an NPM Access Token**:
    -   Go to [npmjs.com](https://www.npmjs.com/).
    -   Navigate to **Access Tokens** > **Generate New Token** (Classic Token).
    -   Select **Automation** type.
2.  **Add Secret to GitHub**:
    -   Go to your repository on GitHub.
    -   Navigate to **Settings** > **Secrets and variables** > **Actions**.
    -   Create a **New repository secret** named `NPM_TOKEN` and paste your token.

### Triggering a Release

1.  Update the version in `package.json` and push to `master`.
2.  Go to the **Releases** section on GitHub.
3.  Click **Draft a new release**.
4.  Create a new tag (e.g., `v0.1.0`) and publish the release.
5.  GitHub Actions will handle the rest!
