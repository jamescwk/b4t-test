# B4T website revamp — prototype

A static, front-end-only redesign concept for [b4t.org](https://b4t.org), built for review on GitHub Pages.

## What's included

| Requested feature | Where |
|---|---|
| 1. Region buttons (Africa, Silk Road, Asia) | Hero buttons → `#regions` tabs with countries, leader and focus |
| 2. Platform connecting resources to needs | `#connect` — filterable needs/resources, post a need / offer a resource |
| 3. Members-only features for sensitive issues | Locked listings, `#members` section, login modal, `members.html` portal |
| 4. Prompts for updates | `#updates` sign-up (regions, topics, frequency) + scroll-triggered prompt |
| 5. Training schedules | `#training` — date, programme, venue, format, filter by region |
| 6. Testimonies | `#stories` — drawn from the current Kingdom Impact Stories |
| 7. What is B4T (history, vision, mission, team) | `#about` — vision, mission, timeline, values, ecosystem, impact, who's who |
| 8. Contact us | `#contact` — form with role/region, social links |

## Prototype notes

- **Member login is a demo**: any email + passcode `b4t`. It only sets a browser flag — no real security. Production needs a real auth backend (e.g. WordPress membership plugin, Memberstack, Supabase/Auth0) with server-side content protection.
- **Forms don't submit.** Hook up to a CRM/email platform (Mailchimp, HubSpot, Brevo) or a form backend.
- **Training dates, connect listings and portal content are sample data** and must be replaced by the B4T team.
- Team, history, vision/mission, regions and stories come from the current b4t.org content.
- No real photos are used; gradients stand in until B4T supplies approved project imagery (mindful of security in sensitive regions).

## Structure

```
index.html        Public site (single page)
members.html      Member portal mock (redirects if not "signed in")
styles.css
app.js
```
