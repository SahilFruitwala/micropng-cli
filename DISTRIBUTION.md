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
npm unlink -g micropng
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

1.  **Check NPM Page**: Go to `https://www.npmjs.com/package/micropng`.
2.  **Test Installation**:
    ```bash
    npm install -g micropng
    micropng --version
    ```
3.  **Test NPX**:
    ```bash
    npx micropng --help
    ```

## Standalone Binaries (Experimental)

While we primarily distribute via NPM, you can generate standalone executables using `pkg`:

1.  **Configure `pkg`**: Ensure `package.json` has the correct `bin` entry (pointing to CJS) and `pkg` config.
2.  **Build**:
    ```bash
    npm run build:bin
    ```
    *Note: This requires specific node target configuration and resolving native dependency issues.*
