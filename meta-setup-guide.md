# Meta App Review & Setup Guide

> **CRITICAL WARNING**
> Autodrop's core features (replying to comments and sending DMs) require restricted API permissions. Without these, the application cannot integrate with Instagram accounts.

## Required Permissions to Request:
1. `instagram_manage_comments`
2. `instagram_manage_messages`
3. `pages_messaging`

## Steps to Complete:
1. Go to **[Meta for Developers](https://developers.facebook.com/)** and create a new App (Type: Business).
2. Set up **Facebook Login for Business** and **Instagram Graph API** products inside the app.
3. In the App Review section, request the three permissions listed above.
4. **Important**: You must provide a demo video showing how the automation works. You can record a screen capture of the Autodrop UI we just built, explaining that you use the Graph API to automate replies for creator campaigns.
5. Provide your Privacy Policy URL (Required for Lead Capture features).
6. While waiting for the 4-8 week review cycle, create an **Instagram Test Account** (switch it to Creator/Business mode) and link it to your Facebook page so we can build Phase 1 MVP features safely.

Once your app is approved, you will retrieve the `Client ID` and `Client Secret` to feed into Autodrop's backend variables!
