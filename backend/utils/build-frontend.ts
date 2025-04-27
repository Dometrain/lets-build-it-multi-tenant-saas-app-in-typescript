import * as fs from 'fs';
import { execSync } from 'child_process';

export function buildFrontEnd(frontendPath: string, envVars: {
    userPoolId: string,
    webClientId: string,
    domainName: string,
    stripePublicKey: string
}) {

    const envFileContent = [
        `VITE_DOMAIN_NAME=${envVars.domainName}`,
        `VITE_USER_POOL_ID=${envVars.userPoolId}`,
        `VITE_WEB_CLIENT_ID=${envVars.webClientId}`,
        `VITE_STRIPE_PUBLIC_KEY=${envVars.stripePublicKey}`,
        `VITE_MOCK_DATA=false`
    ].join('\n');

    fs.writeFileSync(`${frontendPath}/.env`, envFileContent);
        
    console.log(`Building frontend in ${frontendPath}`);
    execSync(`npm run build`, {
      stdio: 'inherit',
      cwd: frontendPath,
    });
}