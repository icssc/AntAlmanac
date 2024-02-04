import {
    CloudFormationClient,
    DescribeStacksCommand,
    StackStatus,
    waitUntilStackCreateComplete,
    waitUntilStackDeleteComplete,
    waitUntilStackUpdateComplete,
} from '@aws-sdk/client-cloudformation';
import { WaiterConfiguration, WaiterResult } from '@aws-sdk/util-waiter';

/**
 * Wait for existing CloudFormation stack to be in an idle state.
 */
export async function waitForStackIdle(
    stackName: string,
    cloudFormationClient: CloudFormationClient = new CloudFormationClient({})
): Promise<WaiterResult | void> {
    const stackCommand = new DescribeStacksCommand({ StackName: stackName });

    try {
        const stackInfo = await cloudFormationClient.send(stackCommand);

        const stackStatus = stackInfo.Stacks?.[0]?.StackStatus;

        if (!stackStatus) {
            return;
        }

        const params: WaiterConfiguration<CloudFormationClient> = {
            client: cloudFormationClient,
            maxWaitTime: 1800,
        };

        switch (stackStatus) {
            case StackStatus.CREATE_IN_PROGRESS:
                return await waitUntilStackCreateComplete(params, { StackName: stackName });

            case StackStatus.UPDATE_IN_PROGRESS:
                return await waitUntilStackUpdateComplete(params, { StackName: stackName });

            case StackStatus.DELETE_IN_PROGRESS:
                return await waitUntilStackDeleteComplete(params, { StackName: stackName });

            default:
                return;
        }
    } catch {
        return;
    }
}
