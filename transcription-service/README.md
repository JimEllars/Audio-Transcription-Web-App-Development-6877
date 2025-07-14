# AXiM Transcription Service WordPress Plugin

A WordPress plugin that enables embedding of the AXiM Transcription Service widget anywhere on your website using shortcodes.

## Features

- Embedded transcription service widget with dark mode UI
- Simple shortcode integration
- Admin dashboard with analytics
- Detailed reporting capabilities
- Fully customizable through WordPress admin

## Installation

1. Upload the `transcription-service` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Use the shortcode `[axim_transcription]` to embed the widget

## Usage

Basic usage:
```php
[axim_transcription]
```

With options:
```php
[axim_transcription default_plan="basic"]
```

## Available Options

- `default_plan`: student or basic (default)

## Multiple Instances

The plugin supports multiple widget instances on the same page. Each instance will maintain its own state and configuration.

## Admin Interface

The plugin includes a comprehensive admin interface with:

- Analytics dashboard
- Order management
- Settings configuration
- Automated reporting

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Support

For support, please contact support@aximsystems.com