# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-01-30

### Added
- Added `--ignore` (`-i`) flag to exclude specific files or directories using glob patterns.
- Added `--keep-metadata` flag to preserve EXIF and other image metadata during compression.
- Enhanced CLI tests to cover ignore patterns and metadata handling.

### Changed
- Major version bump to reflect significant new feature additions.

## [0.2.4] - 2026-01-30

### Changed
- **Breaking Change**: Removed the resize feature (`-w`, `--width`) to keep the tool focused strictly on high-performance compression.
- Updated documentation to reflect the streamlined feature set.

## [0.2.3] - 2026-01-30

### Fixed
- Fixed GitHub Actions publishing issue by correctly configuring registry authentication.
- Corrected package name and scope.

## [0.1.0] - 2026-01-29

### Added
- Initial release.
- Support for JPEG, PNG, WebP, and AVIF compression.
- Recursive directory processing.
- Atomic safe-replace functionality.
- Parallel processing with concurrency control.
