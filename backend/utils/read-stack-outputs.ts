import { execSync } from 'child_process';

export function readStackOutput(stackName: string, exportName: string) {
    try {
        const cmd = `aws cloudformation describe-stacks --stack-name ${stackName} --query "Stacks[0].Outputs[?ExportName=='${exportName}'].OutputValue" --output text`;
        const value = execSync(cmd).toString().trim();

        if (!value || value.includes('${Token')) {
            return null;
        }
        return value;
    } catch (e: any) {
        if (e.message.includes('An error occurred (ValidationError) when calling the DescribeStacks operation:')) {
            console.warn(`Could not get backend stack output '${exportName}', this may be because the backend has not yet been deployed`);
            return null;
        } else {
            throw e;
        }
    }
}