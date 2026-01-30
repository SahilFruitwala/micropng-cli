# Contributing to ImgPress

Thank you for your interest in contributing to ImgPress! We welcome contributions from the community.

## Development Setup

1.  **Fork and Clone**
    Fork the repository to your GitHub account and clone it locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/micropng-cli.git
    cd micropng-cli
    ```

2.  **Install Dependencies**
    We use `npm` for dependency management:
    ```bash
    npm install
    ```

3.  **Build the Project**
    The project uses `tsup` for building:
    ```bash
    npm run build
    ```
    To run in watch mode during development:
    ```bash
    npm run dev
    ```

## Running Tests

We use `vitest` for testing. Please ensure all tests pass before submitting a PR.

-   **Run Unit & Integration Tests**:
    ```bash
    npm test
    ```

-   **Check Test Coverage**:
    ```bash
    npm run test:coverage
    ```

## Project Structure

-   `src/index.ts`: Main CLI entry point and argument parsing.
-   `src/compressor.ts`: Core image processing logic using `sharp`.
-   `src/utils/`: Helper functions (if any).
-   `dist/`: Compiled output files.

## Submitting a Pull Request

1.  Create a new branch for your feature or bug fix: `git checkout -b feature/amazing-feature`.
2.  Make your changes and ensure tests pass.
3.  Commit your changes: `git commit -m "feat: add amazing feature"`.
4.  Push to your fork: `git push origin feature/amazing-feature`.
5.  Open a Pull Request on the main repository.

## Styles & Standards

-   Use **TypeScript** for all new code.
-   Follow the existing code style (Prettier/ESLint if configured).
-   Add tests for any new functionality.
