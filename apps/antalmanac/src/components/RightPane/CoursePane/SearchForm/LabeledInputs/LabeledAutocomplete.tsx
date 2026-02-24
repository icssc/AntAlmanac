import { LabeledTextField } from "$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledTextField";
import {
    Autocomplete,
    type AutocompleteProps,
    Popper,
    type PopperProps,
    type TextFieldProps,
} from "@mui/material";
import { useEffect, useId, useState } from "react";

interface LabeledAutocompleteProps<
    T,
    Multiple extends boolean = false,
    DisableClearable extends boolean = false,
    FreeSolo extends boolean = false,
> {
    label: string;
    autocompleteProps: Omit<
        AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
        "renderInput"
    >;
    textFieldProps?: TextFieldProps;
    isAligned?: boolean;
}

const ResponsivePopper = (props: PopperProps) => {
    const { anchorEl, style, ...rest } = props;
    const [measuredWidth, setMeasuredWidth] = useState<number>();

    useEffect(() => {
        if (!anchorEl || !(anchorEl instanceof HTMLElement)) return;

        const el = anchorEl;
        const update = () => setMeasuredWidth(el.clientWidth);

        update();

        const ro = new ResizeObserver(() => update());
        ro.observe(el);

        // Fallback
        window.addEventListener("resize", update);

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", update);
        };
    }, [anchorEl]);

    return (
        <Popper
            {...rest}
            anchorEl={anchorEl}
            style={{
                ...style,
                ...(measuredWidth ? { width: measuredWidth } : null),
            }}
        />
    );
};

export const LabeledAutocomplete = <T,>({
    label,
    autocompleteProps,
    textFieldProps,
    isAligned,
}: LabeledAutocompleteProps<T>) => {
    const id = useId();

    return (
        <Autocomplete
            size="small"
            id={id}
            sx={{
                display: "flex",
                flex: 1,
                width: "100%",
            }}
            {...autocompleteProps}
            PopperComponent={ResponsivePopper}
            renderInput={(params) => (
                <LabeledTextField
                    label={label}
                    isAligned={isAligned}
                    id={id}
                    textFieldProps={{
                        ...textFieldProps,
                        InputProps: {
                            ...params.InputProps,
                            ...textFieldProps?.InputProps,
                        },
                        inputProps: {
                            ...params.inputProps,
                            ...textFieldProps?.inputProps,
                        },
                    }}
                />
            )}
        ></Autocomplete>
    );
};
