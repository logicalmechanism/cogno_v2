# Changelog

## alpha-unreleased

### Added

- **app**: added markdown to comments
- **app**: added auto blurred images to comments
  - *```![Alt text](https://example.com/your-image.jpg)```*
  - *auto converts to lazy loaded blurred image*
- **app**: added external link component for markdown rendering
- **app**: added markdown to thread content
  - *Images are not allowed in thread content, use image url field*

### Fixed

- **app**: fixed meshjs version
- **app**: fixed and simplified the profile transaction

### Changed

- **app**: changed success text link to ExternalLink component
- **app**: changed github link to ExternalLink component
- **app**: changed profile wireframe to full and mini with labels
- **app**: changed notification to have a successful flag, red for bad or green for good

### Removed

- **app**: removed some logs

## alpha-06-08-24

### Added

- **app**: added wire frame folder to hold penpot design wire frames
- **app**: added default image gimp file
- **app**: added error image for images that do not load properly
- **app**: added filter.ts file to hold all the thread filters
- **app**: added my friends and top threads filters

### Fixed

- **app**: fixed the background scrolling issue for open modals
- **app**: fixed blurred images not being centered and jumping in size
- **cogno-project**: fixed cogno.forum readme link
- **app**: fixed blurred images auto going into loading.. when refreshing the forum

### Changed

- **app**: changed medium-text to dark-text
- **app**: changed the blues around in the colors
- **app**: changed the roundedness of the wallet connect button
- **app**: changed inputs to disable grammerly automatically
- **app**: changed help text to be always on the right hand side of the help icon
- **app**: changed refresh cogno button location to the navbar, refresh cogno -> refresh
- **app**: changed what is being searched inside the thread list

### Removed

- **app**: removed medium colors

## alpha-23-07-24

*main is now set up for cicd so staging branch will contain new updates*

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
- **app**: added arweave and ipfs support for blur image
- **app**: added moderation settings to cogno profile
- **app**: added mini profile to threads
- **app**: added ability to add and block users

### Fixed

- **headless**: fixed the newline error occuring when making comments on threads
- **app**: fixed the image size for threads both at the preview and modal
- **app**: fixed text on buttons for the threadlist for dynamic screen sizes
- **app**: fixed the cogno token not be reset when changing accounts

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
- **app**: changed the error messages to lowercase
- **app**: changed the font family to monospaced

### Removed

- **app**: removed commented out code that can't work for now

## pre-alpha-17-07-24

- **app**: pre-alpha release of frontend application
- **headless**: pre-alpha release of headless application
- **contracts**: pre-alpha release of contracts
