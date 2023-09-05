import { BackendProps } from './backend';
import { FrontendProps } from './frontend';

export const transformUrl = (url: string, props: BackendProps | FrontendProps): string => {
    // Staging
    if (props.prNum !== undefined) {
        return `staging-${props.prNum}.${url}`;
    }

    if (props.stage === 'alpha') return 'alpha.' + url;
    else if (props.stage === 'dev') return 'dev.' + url;
    return url;
};
