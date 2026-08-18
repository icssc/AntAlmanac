export interface AuthAdditionalData {
    returnUrl?: string;
    provider?: string;
}

export enum Provider {
    Google = 'OIDC',
    Apple = 'APPLE',
}
