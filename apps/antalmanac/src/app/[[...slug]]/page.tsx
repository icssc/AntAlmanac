import { ClientOnly } from "./client";

export function generateStaticParams() {
    return [{ slug: [] }, { slug: ["added"] }, { slug: ["map"] }];
}

export default function Page() {
    return <ClientOnly />;
}
