export default function RestrictionText({ restriction }: { restriction: string }) {
    return (
        <div className="course-restrictions">
            <h4>Restrictions</h4>
            <p>
                <i>{restriction?.trim() ? restriction : 'There are no restrictions for this course.'}</i>
            </p>
            {/* Restriction tags are term-specific and need a WebSoC query. */}
        </div>
    );
}
