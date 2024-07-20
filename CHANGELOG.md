# Changelog

## pre-alpha-Unreleased

### Added

- **cogno-project**: added changelog and contributing markdown files
- **contracts**: added top level and public function documentation, and added additional tests
- **headless**: added a display cogno functionality, uses feh to view profile images
- **headless**: added python scripts for cogno creation and updating
- **headless**: added python scripts for thread creation and comment updating
- **headless**: added a display threads and thread functionality, uses feh to view thread images
- **headless**: added beginning of comment parser for advance comments on headless
- **cogno-project**: added text to contributing about the bounty system
- **cogno-project**: added text to the landing README in the parent directory
- **cogno-project**: added text to the headless README
- **headless**: added script reference tx, contracts, and hashes
- **headless**: added guardrails to parent level headless scripts
- **headless**: added wallet protections
- **headless**: added doctests and documentation to the python scripts
- **app**: added standard app colors for backgrounds, borders, and text
- **app**: added an Etc category
- **app**: added default image instead of placeholder
- **app**: added top threads and my friends thread filter
- **app**: arweave and ipfs support for blur image

### Fixed

- **headless**: fixed the newline error occuring when making comments on threads
- **app**: fixed the image size for threads both at the preview and modal
- **app**: fixed text on buttons for the threadlist for dynamic screen sizes


### Changed

- **headless**: changed the cogno creation, removal, and updating by adding in guards to prevent accidental changes
- **headless**: changed the thread creation, removal, and commenting by adding in guards to prevent accidental changes
- **app**: changed how the comments are displayed on a thread, they now perserve newlines and wrap
- **app**: changed shadow boxes on all the things
- **app**: changed any duration to e seconds
- **app**: changed the tos on the landing page
- **app**: changed the faq to full width and added additional q&a
- **app**: changed cogno app is now just the forum
- **app**: changed how the image is displayed if no content is present
- **app**: changed the thread modal width from 3xl to 5xl

### Removed

- **app**: removed commented out code that can't work for now

## pre-alpha-17-07-24

- **app**: pre-alpha release of frontend application
- **headless**: pre-alpha release of headless application
- **contracts**: pre-alpha release of contracts