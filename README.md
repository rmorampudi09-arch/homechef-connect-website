# HomeChef Connect Static Website

This is a plain HTML/CSS/JavaScript landing page. No React installation is required.

## Files
- index.html
- styles.css
- script.js

## Run locally
Just double-click `index.html` or open it in your browser.

## Deploy to Azure Static Web Apps
1. Create a GitHub repository.
2. Upload these three files to the repository root.
3. In Azure Portal, create a Static Web App.
4. Connect to your GitHub repo.
5. Build settings:
   - App location: `/`
   - API location: blank
   - Output location: blank
6. Deploy.

## Connect domain
In Azure Static Web App -> Custom domains, add `www.yourdomain.com`.
For external DNS, create a CNAME:
- Type: CNAME
- Name: www
- Value: your Azure Static Web App default hostname

Azure will provide HTTPS certificate automatically after validation.
