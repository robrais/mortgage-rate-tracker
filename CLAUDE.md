I am building a web app to track mortgage refinance rates and alert users when the rates fall within their desired bracket.

Functional Requriements:

Display up to date mortgage refinance rates (weekly) with choices for different mortgage types (30 yrs, 15 yrs)
users can signin with an email provider and enter their target mortgage type (s) and desired rate
The app sends an email update to the user when rates get within the target range.
Technical Design

This is a web application intended to be hosted on a remote server and open on the public internet through a domain name. The initial prototype will be hosted locally.
No particular guidance on programming language. Suggests whatever is fastest to prototype for both front end and backend
Use prebuilt librariries as much as possible and avoid writing from scratch
Make requests to a mortgage API that will be provided later to retrieve the mortgage interest rate data. The API supports querying by data range (landing page) and by individual date (good for checking daily if should send an email)
Authentication/Authorization
Email provider to send emails
Structure storege (MySQL) to keep track of emails, target mortgage type (s) and target rate


Technical Design: 

Web API to retrieve mortgage data: https://api.api-ninjas.com/v1/mortgagerate
Sample response JSON
[
  {
    "week": "current",
    "data": {
      "frm_30": "6.09",
      "frm_15": "5.44",
      "week": "2026-02-12"
    }
  }
]