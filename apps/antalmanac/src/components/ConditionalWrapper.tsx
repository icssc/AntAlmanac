import { forwardRef, ReactElement } from 'react';

interface ConditionalWrapperProps {
    condition: boolean;
    wrapper: (children: React.ReactNode) => React.ReactElement;
    children: React.ReactNode; // Add this line

    // children: ReactElement;
}

// This uses forwardRef because at some point we got a console warning about "functional components cannot be given refs"
//  (https://github.com/icssc/AntAlmanac/pull/231/commits/bd80dd085e4f502292b4e1002fdc8fa398f375ab)
/**
 * Wraps around a single element. This means that if you need to wrap multiple elements, they need to be inside a fragment.
 * This uses forwardRef because at some point we got a console warning
 * about "functional components cannot be given refs" (https://github.com/icssc/AntAlmanac/pull/231/commits/bd80dd085e4f502292b4e1002fdc8fa398f375ab)
 */
const ConditionalWrapper = forwardRef<Element, ConditionalWrapperProps>(({ condition, wrapper, children }, ref) => {
    return <>{condition ? wrapper(children) : children}</>;
});

ConditionalWrapper.displayName = 'ConditionalWrapper';

export default ConditionalWrapper;
