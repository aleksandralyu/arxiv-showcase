/**
 * MethodologyCallout — compact "How we did this" note for pipeline steps.
 * Props:
 *   step   — e.g. "Step 3"
 *   title  — e.g. "K-Means Clustering (k=50)"
 *   input  — e.g. "500-dim SVD vectors, 2.4M papers"
 *   output — e.g. "50 cluster assignments"
 *   note   — e.g. "k selected via elbow method"
 */
export default function MethodologyCallout({ step, title, input, output, note }) {
  return (
    <div className="bg-gray-800/20 border border-gray-700/30 rounded-lg p-3 text-xs text-gray-500">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {step && (
          <span className="text-gray-600 uppercase tracking-wider font-medium shrink-0">{step}</span>
        )}
        {title && (
          <span className="text-gray-400 font-medium shrink-0">{title}</span>
        )}
        {input && (
          <span className="shrink-0">
            <span className="text-gray-600">in: </span>
            {input}
          </span>
        )}
        {output && (
          <span className="shrink-0">
            <span className="text-gray-600">out: </span>
            {output}
          </span>
        )}
        {note && (
          <span className="text-gray-600 italic">{note}</span>
        )}
      </div>
    </div>
  )
}
