import type { CSSProperties } from 'react';

import { Section, Text } from '@react-email/components';

import { BLUE } from '../theme';
import { StatusPill } from './StatusPill';

export interface StatusChange {
    from: string;
    to: string;
}

interface WhatChangedBoxProps {
    statusChange?: StatusChange | null;
    restrictionCodesChange?: { from: string; to: string } | null;
}

const codeBadge: CSSProperties = {
    padding: '4px 10px',
    display: 'inline-block',
    fontWeight: '600',
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    color: '#000000',
};

export function WhatChangedBox({ statusChange, restrictionCodesChange }: WhatChangedBoxProps) {
    if (!statusChange && !restrictionCodesChange) return null;

    return (
        <Section
            style={{
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                padding: '16px',
                margin: '0 0 24px',
                borderLeft: `4px solid ${BLUE}`,
            }}
        >
            <Text
                style={{
                    color: '#000000',
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 0 8px',
                }}
            >
                What Changed
            </Text>
            <table style={{ width: '100%' as const, borderCollapse: 'collapse' as const }}>
                <tbody>
                    {statusChange && (
                        <tr>
                            <td
                                style={{
                                    padding: '4px 0',
                                    fontSize: '14px',
                                    color: '#000000',
                                }}
                            >
                                Enrollment Status:
                            </td>
                            <td style={{ padding: '4px 0', fontSize: '14px' }}>
                                <StatusPill status={statusChange.from} />
                                <span style={{ margin: '0 6px' }}>→</span>
                                <StatusPill status={statusChange.to} />
                            </td>
                        </tr>
                    )}
                    {restrictionCodesChange && (
                        <tr>
                            <td
                                style={{
                                    padding: '4px 0',
                                    fontSize: '14px',
                                    color: '#000000',
                                }}
                            >
                                Restriction Codes:
                            </td>
                            <td style={{ padding: '4px 0', fontSize: '14px' }}>
                                <span style={codeBadge}>{restrictionCodesChange.from}</span>
                                <span style={{ margin: '0 6px' }}>→</span>
                                <span style={codeBadge}>{restrictionCodesChange.to}</span>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </Section>
    );
}
