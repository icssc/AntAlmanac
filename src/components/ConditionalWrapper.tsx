import {forwardRef, ReactElement} from 'react';

interface ConditionalWrapperProps {
    condition: boolean,
    wrapper: (children: ReactElement) => ReactElement
    children: ReactElement
}

// This uses forwardRef because at some point we got a console warning
// about "functional components cannot be given refs" (https://github.com/icssc/AntAlmanac/pull/231/commits/bd80dd085e4f502292b4e1002fdc8fa398f375ab)
const ConditionalWrapper = forwardRef<ReactElement, ConditionalWrapperProps>(({condition, wrapper, children}, ref) => {
    return condition ? wrapper(children) : children;
});

export default ConditionalWrapper;
