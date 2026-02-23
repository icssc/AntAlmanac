import { LabeledAutocomplete } from "$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete";
import RightPaneStore from "$components/RightPane/RightPaneStore";
import { termData } from "$lib/termData";
import { useCallback, useEffect, useState } from "react";

export function TermSelector() {
    const [term, setTerm] = useState<string>(() => RightPaneStore.getFormData().term);

    const handleChange = (_: unknown, option: string | null) => {
        const value = option ?? termData.at(0)?.shortName ?? "";

        setTerm(value);

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set("term", value);
        history.replaceState({ url: "url" }, "url", `/?${urlParams}`);

        RightPaneStore.updateFormValue("term", value);
    };

    const resetField = useCallback(() => {
        setTerm(RightPaneStore.getFormData().term);
    }, []);

    useEffect(() => {
        RightPaneStore.on("formReset", resetField);

        return () => {
            RightPaneStore.off("formReset", resetField);
        };
    }, [resetField]);

    return (
        <LabeledAutocomplete
            label="Term"
            autocompleteProps={{
                value: term,
                options: termData.map((term) => term.shortName),
                getOptionLabel: (option) =>
                    termData.find((term) => term.shortName === option)?.longName ?? "",
                autoHighlight: true,
                openOnFocus: true,
                onChange: handleChange,
                noOptionsText: "No terms match the search",
            }}
            textFieldProps={{
                fullWidth: true,
            }}
            isAligned
        />
    );
}
