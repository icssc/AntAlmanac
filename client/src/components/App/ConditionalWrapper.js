import React from 'react';

const ConditionalWrapper = React.forwardRef(({ condition, wrapper, children }, ref) => {
    return condition ? wrapper(children) : children;
});

export default ConditionalWrapper;
